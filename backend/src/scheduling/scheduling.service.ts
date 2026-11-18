// src/scheduling/scheduling.service.ts
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, DataSource, EntityManager, In, LessThan } from 'typeorm';
import { Appointment, AppointmentCreator, AppointmentStatus } from '../Entity-User/Appointment.entity.js';
import { DoctorProfile } from '../Entity-User/Doctor.entity.js';
import { DoctorAvailability } from '../Entity-User/DoctorAvailability.entity.js';
import { CaseStatus, MedicalCase } from '../Entity-User/MedicalCase.entity.js';
import { AuditService } from '../case-support/audit.service.js';
import {
  SESSION_HOURS, WorkSession, addDays, isIsoDate, sessionOf, toVnDate, vnDateTime,
} from '../common/app-time.util.js';
import type { AvailableDoctorsQuery, BookAppointmentDto, SetAvailabilityDto } from './scheduling.dto.js';

const ACTIVE = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED];
const BOOK_AHEAD_DAYS = 14;
/** Lịch quá giờ hẹn ngần này thì tự chuyển sang "hoàn tất" để giải phóng hạn mức của bệnh nhân */
const AUTO_COMPLETE_AFTER_MS = 2 * 3600_000;

const slotTaken = () =>
  new ConflictException({
    message: 'Khung giờ hẹn đã có lịch hoặc bác sĩ đã đủ số lịch trong ngày. Hãy chọn giờ khác.',
    code: 'SLOT_TAKEN',
  });

export const doctorLabel = (d: DoctorProfile) =>
  `${d.degree ? `${d.degree} ` : ''}${d.user?.name ?? 'Bác sĩ'}`.trim();

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    private readonly ds: DataSource,
    private readonly audit: AuditService,
  ) {}

  // ------------------------------------------------------------ dùng chung

  /**
   * Tạo lịch hẹn trong transaction của người gọi. Khóa dòng bác sĩ để kiểm tra trần số ca/ngày không bị đua;
   * index unique (doctor, scheduled_at) còn chặn trùng giờ.
   */
  async reserve(
    m: EntityManager,
    a: { doctorId: string; patientId: string; caseId: string | null; scheduledAt: Date; createdBy: AppointmentCreator; note?: string },
  ): Promise<Appointment> {
    const doctor = await m
      .createQueryBuilder(DoctorProfile, 'd')
      .setLock('pessimistic_write')
      .where('d.id = :id', { id: a.doctorId })
      .getOne();
    if (!doctor) throw new NotFoundException('Không tìm thấy bác sĩ');

    const appointmentDate = toVnDate(a.scheduledAt);
    const count = await m.count(Appointment, { where: { doctorId: a.doctorId, appointmentDate, status: In(ACTIVE) } });
    if (count >= doctor.maxAppointmentsPerDay) throw slotTaken();

    try {
      return await m.save(
        m.create(Appointment, {
          doctorId: a.doctorId,
          patientId: a.patientId,
          caseId: a.caseId,
          scheduledAt: a.scheduledAt,
          appointmentDate,
          createdBy: a.createdBy,
          note: a.note,
        }),
      );
    } catch (err) {
      if ((err as { code?: string })?.code === '23505') throw slotTaken();
      throw err;
    }
  }

  private pickSlot(date: string, session: WorkSession, taken: Set<number>): Date | null {
    const now = Date.now();
    for (const hour of SESSION_HOURS[session]) {
      const at = vnDateTime(date, hour);
      if (at.getTime() > now && !taken.has(at.getTime())) return at;
    }
    return null;
  }

  private assertBookableDate(date: string) {
    const today = toVnDate(new Date());
    if (!isIsoDate(date) || date < today || date > addDays(today, BOOK_AHEAD_DAYS)) {
      throw new BadRequestException(`Chỉ đặt được lịch trong ${BOOK_AHEAD_DAYS} ngày tới`);
    }
  }

  private async ownedReviewedCase(m: EntityManager, userId: string, caseId: string): Promise<MedicalCase> {
    const c = await m.findOne(MedicalCase, { where: { id: caseId, patient: { userId } } });
    if (!c) throw new NotFoundException('Không tìm thấy hồ sơ');
    if (c.status !== CaseStatus.REVIEWED) throw new ConflictException('Chỉ đặt lịch được khi hồ sơ đã có kết luận');
    return c;
  }

  // ------------------------------------------------------------ vòng đời lịch hẹn

  /** Lịch đã quá giờ thì hoàn tất; nếu không, ca đã duyệt có lịch sẽ giữ hạn mức vĩnh viễn. An toàn khi chạy nhiều instance. */
  @Cron(CronExpression.EVERY_HOUR)
  async autoComplete(): Promise<void> {
    try {
      await this.ds
        .getRepository(Appointment)
        .update({ status: In(ACTIVE), scheduledAt: LessThan(new Date(Date.now() - AUTO_COMPLETE_AFTER_MS)) }, { status: AppointmentStatus.COMPLETED });
    } catch (err) {
      this.logger.warn(`Tự hoàn tất lịch hẹn thất bại: ${(err as Error).message}`);
    }
  }

  /** Bệnh nhân hủy lịch của chính mình (chỉ lịch còn hiệu lực và chưa đến giờ). Ca vẫn "đã duyệt", đặt lại được. */
  async cancel(userId: string, appointmentId: string) {
    const res = await this.ds
      .createQueryBuilder()
      .update(Appointment)
      .set({ status: AppointmentStatus.CANCELLED, cancelledAt: () => 'now()' })
      .where(
        `id = :id AND status IN ('scheduled', 'confirmed') AND scheduled_at > now()
         AND patient_id IN (SELECT id FROM patient_profiles WHERE user_id = :userId)`,
        { id: appointmentId, userId },
      )
      .execute();
    if (!res.affected) throw new NotFoundException('Không hủy được lịch hẹn');

    void this.audit.log({ actorUserId: userId, action: 'appointment.cancelled', entityType: 'appointment', entityId: appointmentId });
    return { success: true };
  }

  // ------------------------------------------------------------ bệnh nhân

  /** Bác sĩ đã xác minh, đúng khoa của hồ sơ, đang làm việc vào ngày đó và còn khung trống */
  async availableDoctors(userId: string, q: AvailableDoctorsQuery) {
    const c = await this.ownedReviewedCase(this.ds.manager, userId, q.caseId);
    this.assertBookableDate(q.date);

    const rows = await this.ds.getRepository(DoctorAvailability).find({
      where: { workDate: q.date, doctor: { isVerified: true, specialties: { id: c.specialtyId } } },
      relations: { doctor: { user: true } },
    });
    if (!rows.length) return [];

    const ids = [...new Set(rows.map((r) => r.doctorId))];
    const booked = await this.ds.getRepository(Appointment).find({
      where: { doctorId: In(ids), appointmentDate: q.date, status: In(ACTIVE) },
      select: { doctorId: true, scheduledAt: true },
    });

    const out = [];
    for (const id of ids) {
      const mine = rows.filter((r) => r.doctorId === id);
      const doc = mine[0].doctor;
      const taken = booked.filter((b) => b.doctorId === id);
      if (taken.length >= doc.maxAppointmentsPerDay) continue;

      const takenSet = new Set(taken.map((t) => t.scheduledAt.getTime()));
      const sessions = mine.map((r) => r.session).filter((s) => this.pickSlot(q.date, s, takenSet));
      if (!sessions.length) continue;

      out.push({
        doctorId: id,
        name: doctorLabel(doc),
        hospital: doc.hospital ?? null,
        experienceYears: doc.experienceYears,
        bio: doc.bio ?? null,
        sessions,
      });
    }
    return out;
  }

  async book(userId: string, dto: BookAppointmentDto) {
    this.assertBookableDate(dto.date);

    return this.ds.transaction(async (m) => {
      // Khóa dòng ca (chỉ của chính bệnh nhân) để hai request đồng thời không cùng qua kiểm tra ALREADY_BOOKED
      await m
        .createQueryBuilder(MedicalCase, 'c')
        .setLock('pessimistic_write')
        .where('c.id = :id AND c.patientId IN (SELECT id FROM patient_profiles WHERE user_id = :userId)', { id: dto.caseId, userId })
        .getOne();
      const c = await this.ownedReviewedCase(m, userId, dto.caseId);

      if (await m.count(Appointment, { where: { caseId: c.id, status: In(ACTIVE) } })) {
        throw new ConflictException({ message: 'Hồ sơ này đã có lịch hẹn còn hiệu lực', code: 'ALREADY_BOOKED' });
      }

      const avail = await m.findOne(DoctorAvailability, {
        where: {
          doctorId: dto.doctorId,
          workDate: dto.date,
          session: dto.session,
          doctor: { isVerified: true, specialties: { id: c.specialtyId } },
        },
        relations: { doctor: { user: true } },
      });
      if (!avail) throw new ConflictException('Bác sĩ không làm việc ở buổi này hoặc không đúng chuyên khoa');

      const taken = await m.find(Appointment, {
        where: { doctorId: dto.doctorId, appointmentDate: dto.date, status: In(ACTIVE) },
        select: { scheduledAt: true },
      });
      const at = this.pickSlot(dto.date, dto.session, new Set(taken.map((t) => t.scheduledAt.getTime())));
      if (!at) throw slotTaken();

      const appt = await this.reserve(m, {
        doctorId: dto.doctorId,
        patientId: c.patientId,
        caseId: c.id,
        scheduledAt: at,
        createdBy: AppointmentCreator.PATIENT,
        note: dto.note,
      });
      await this.audit.log(
        { actorUserId: userId, action: 'appointment.booked', entityType: 'appointment', entityId: appt.id, metadata: { caseId: c.id } },
        m,
      );

      return {
        id: appt.id,
        scheduledAt: appt.scheduledAt.toISOString(),
        status: appt.status,
        doctorName: doctorLabel(avail.doctor),
        hospital: avail.doctor.hospital ?? null,
      };
    });
  }

  // ------------------------------------------------------------ bác sĩ

  async getAvailability(doctorId: string, weekStart: string) {
    if (!isIsoDate(weekStart)) throw new BadRequestException('Ngày không hợp lệ');
    const rows = await this.ds.getRepository(DoctorAvailability).find({
      where: { doctorId, workDate: Between(weekStart, addDays(weekStart, 6)) },
      order: { workDate: 'ASC' },
    });
    return rows.map((r) => ({ date: r.workDate, session: r.session }));
  }

  /** Ghi đè lịch làm việc của cả tuần (từ hôm nay trở đi). Không cho bỏ buổi đang có lịch hẹn. */
  async setAvailability(doctorId: string, dto: SetAvailabilityDto) {
    if (!isIsoDate(dto.weekStart)) throw new BadRequestException('Ngày không hợp lệ');
    const today = toVnDate(new Date());
    const end = addDays(dto.weekStart, 6);
    const from = dto.weekStart < today ? today : dto.weekStart;

    const wanted = new Map<string, DoctorAvailability>();
    for (const s of dto.slots) {
      if (!isIsoDate(s.date) || s.date < dto.weekStart || s.date > end) throw new BadRequestException('Có ngày nằm ngoài tuần đang chỉnh');
      if (s.date < today) continue;
      wanted.set(`${s.date}|${s.session}`, Object.assign(new DoctorAvailability(), { doctorId, workDate: s.date, session: s.session }));
    }

    await this.ds.transaction(async (m) => {
      await m.createQueryBuilder(DoctorProfile, 'd').setLock('pessimistic_write').where('d.id = :id', { id: doctorId }).getOne();

      const booked = await m.find(Appointment, {
        where: { doctorId, appointmentDate: Between(from, end), status: In(ACTIVE) },
        select: { scheduledAt: true },
      });
      if (booked.some((a) => !wanted.has(`${toVnDate(a.scheduledAt)}|${sessionOf(a.scheduledAt)}`))) {
        throw new ConflictException({
          message: 'Không thể bỏ buổi đã có lịch hẹn của bệnh nhân',
          code: 'AVAILABILITY_HAS_APPOINTMENTS',
        });
      }

      await m.delete(DoctorAvailability, { doctorId, workDate: Between(from, end) });
      if (wanted.size) await m.save(DoctorAvailability, [...wanted.values()]);
    });

    return { success: true };
  }

  async doctorAppointments(doctorId: string) {
    const today = toVnDate(new Date());
    const rows = await this.ds.getRepository(Appointment).find({
      where: { doctorId, status: In(ACTIVE), appointmentDate: Between(today, addDays(today, 60)) },
      relations: { patient: { user: true } },
      order: { scheduledAt: 'ASC' },
      take: 200,
    });
    return rows.map((a) => ({
      id: a.id,
      scheduledAt: a.scheduledAt.toISOString(),
      status: a.status,
      caseId: a.caseId,
      patientName: a.patient.user?.name ?? 'Bệnh nhân',
      note: a.note ?? null,
    }));
  }

  // ------------------------------------------------------------ công khai

  async publicDoctors() {
    const docs = await this.ds.getRepository(DoctorProfile).find({
      where: { isVerified: true },
      relations: { user: true, specialties: true },
      order: { experienceYears: 'DESC' },
    });
    return docs.map((d) => ({
      id: d.id,
      name: d.user?.name ?? 'Bác sĩ',
      degree: d.degree ?? null,
      hospital: d.hospital ?? null,
      experienceYears: d.experienceYears,
      bio: d.bio ?? null,
      specialties: d.specialties.map((s) => ({ code: s.code, name: s.name })),
    }));
  }
}
