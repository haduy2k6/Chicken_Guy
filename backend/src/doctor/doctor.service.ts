// src/doctor/doctor.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, DataSource, In, Not, SelectQueryBuilder } from 'typeorm';
import { AiAnalysis, AnalysisStatus } from '../Entity-User/AiAnalysis.entity.js';
import { AppointmentCreator } from '../Entity-User/Appointment.entity.js';
import { CaseImage } from '../Entity-User/CaseImage.entity.js';
import { DoctorProfile } from '../Entity-User/Doctor.entity.js';
import { DoctorReview, ReviewDecision } from '../Entity-User/DoctorReview.entity.js';
import { CaseStatus, MedicalCase } from '../Entity-User/MedicalCase.entity.js';
import { Referral } from '../Entity-User/Referral.entity.js';
import { Specialty } from '../Entity-User/Specialty.entity.js';
import { AuditService } from '../case-support/audit.service.js';
import { INTAKE } from '../case-support/intake-schema.js';
import { StorageService } from '../case-support/storage.service.js';
import type { DoctorCtx } from '../guard/verified-doctor.guard.js';
import { SchedulingService, doctorLabel } from '../scheduling/scheduling.service.js';
import type { QueueQueryDto, ReviewCaseDto } from './doctor.dto.js';

const FORM_VERSION = 1;
const QUEUE_LIMIT = 100;

type AiStatus = 'processing' | 'completed' | 'failed';
const aiStatusOf = (s: AnalysisStatus[]): AiStatus =>
  s.includes(AnalysisStatus.PROCESSING) ? 'processing' : !s.length || s.includes(AnalysisStatus.COMPLETED) ? 'completed' : 'failed';

const conflict = (message: string, code: string) => new ConflictException({ message, code });

@Injectable()
export class DoctorService {
  constructor(
    private readonly ds: DataSource,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
    private readonly scheduling: SchedulingService,
  ) {}

  // ------------------------------------------------------------ phạm vi nhìn thấy (dùng chung hàng đợi, chi tiết, review)

  /**
   * Bác sĩ chỉ thấy: ca CHỜ thuộc khoa mình, và ca ĐÃ DUYỆT do chính mình kết luận.
   * Ca CHUYỂN TUYẾN là trạng thái kết thúc: liên kết với bác sĩ bị hủy, chỉ còn bệnh nhân thấy.
   */
  private visibleTo(qb: SelectQueryBuilder<MedicalCase>, d: DoctorCtx) {
    return qb.andWhere(
      new Brackets((w) => {
        w.where('c.status = :pending AND c.specialtyId IN (:...sp)', { pending: CaseStatus.PENDING, sp: d.specialtyIds }).orWhere(
          'c.status = :reviewed AND c.assignedDoctorId = :me',
          { reviewed: CaseStatus.REVIEWED, me: d.id },
        );
      }),
    );
  }

  private baseQuery() {
    return this.ds
      .getRepository(MedicalCase)
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.patient', 'p')
      .innerJoinAndSelect('p.user', 'u')
      .innerJoinAndSelect('c.specialty', 's');
  }

  private async findVisible(d: DoctorCtx, caseId: string): Promise<MedicalCase> {
    const c = await this.visibleTo(this.baseQuery().where('c.id = :caseId', { caseId }), d).getOne();
    if (!c) throw new NotFoundException('Không tìm thấy ca bệnh hoặc bạn không có quyền xem');
    return c;
  }

  private toItem(c: MedicalCase, ai: AiStatus) {
    return {
      id: c.id,
      name: c.patient.user?.name ?? 'Bệnh nhân',
      age: Number(c.intakeData.age) || 0,
      gender: c.patient.gender,
      specialty: c.specialty.code,
      submissionDate: c.createdAt.toISOString(),
      aiRiskScore: c.aiRiskScore ?? null,
      aiStatus: ai,
      status: c.status,
    };
  }

  // ------------------------------------------------------------ hàng đợi

  async getPatientQueue(d: DoctorCtx, q: QueueQueryDto) {
    const qb = this.visibleTo(this.baseQuery(), d);
    if (q.status && q.status !== 'all') qb.andWhere('c.status = :st', { st: q.status });
    if (q.specialty && q.specialty !== 'all') qb.andWhere('s.code = :sc', { sc: q.specialty });

    // status ASC: ca chờ lên đầu (thứ tự enum), rồi điểm AI cao nhất (NULL xuống cuối), rồi mới nhất
    const cases = await qb
      .orderBy('c.status', 'ASC')
      .addOrderBy('c.aiRiskScore', 'DESC', 'NULLS LAST')
      .addOrderBy('c.createdAt', 'DESC')
      .limit(QUEUE_LIMIT)
      .getMany();

    const analyses = cases.length
      ? await this.ds.getRepository(AiAnalysis).find({ where: { caseId: In(cases.map((c) => c.id)) }, select: { caseId: true, status: true } })
      : [];
    const byCase = new Map<string, AnalysisStatus[]>();
    for (const a of analyses) byCase.set(a.caseId, [...(byCase.get(a.caseId) ?? []), a.status]);

    const pendingCount = await this.ds
      .getRepository(MedicalCase)
      .count({ where: { status: CaseStatus.PENDING, specialtyId: In(d.specialtyIds) } });

    return { items: cases.map((c) => this.toItem(c, aiStatusOf(byCase.get(c.id) ?? []))), pendingCount };
  }

  // ------------------------------------------------------------ chi tiết ca

  async getCaseDetails(d: DoctorCtx, caseId: string) {
    const c = await this.findVisible(d, caseId);
    const images = await this.ds.getRepository(CaseImage).find({ where: { caseId }, relations: { analyses: true }, order: { createdAt: 'ASC' } });

    const imageDtos = await Promise.all(
      images.map(async (img) => {
        const a = [...img.analyses].sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime())[0];
        const url = await this.storage.signedUrl(img.storageKey);
        return {
          id: img.id,
          kind: img.kind,
          thumbUrl: url,
          url,
          analysis: a
            ? {
                status: a.status,
                riskScore: a.riskScore ?? null,
                predictedLabel: a.predictedLabel ?? null,
                gradcamUrl: a.gradcamStorageKey ? await this.storage.signedUrl(a.gradcamStorageKey) : null,
              }
            : undefined,
        };
      }),
    );

    void this.audit.log({ actorUserId: d.userId, action: 'case.viewed', entityType: 'case', entityId: caseId, metadata: { doctorId: d.id } });

    const allStatuses = images.flatMap((i) => i.analyses.map((a) => a.status));
    const symptomKeys = INTAKE[c.specialty.code]?.symptomKeys ?? [];

    return {
      ...this.toItem(c, aiStatusOf(allStatuses)),
      version: c.version,
      symptoms: symptomKeys.filter((k) => c.intakeData[k] === 'Yes'),
      patientNote: null,
      intakeData: c.intakeData,
      intakeFormVersion: FORM_VERSION,
      assessmentFormVersion: FORM_VERSION,
      images: imageDtos,
    };
  }

  // ------------------------------------------------------------ kết luận

  async reviewPatientCase(d: DoctorCtx, caseId: string, dto: ReviewCaseDto) {
    const c = await this.findVisible(d, caseId);
    if (c.status !== CaseStatus.PENDING) throw conflict('Ca này đã có kết luận.', 'ALREADY_REVIEWED');

    const escalate = dto.status === 'escalated';
    const toDoctorId = escalate ? dto.referral?.toDoctorId : undefined;
    const toSpecialtyId = escalate ? dto.referral?.toSpecialtyId : undefined;
    if (escalate) await this.assertReferralTarget(d, toDoctorId, toSpecialtyId);

    let followUpAt: Date | undefined;
    if (!escalate && dto.followUpAt) {
      followUpAt = new Date(dto.followUpAt);
      if (followUpAt.getTime() <= Date.now()) throw new BadRequestException('Ngày hẹn tái khám phải ở tương lai');
    }

    await this.ds.transaction(async (m) => {
      // Optimistic lock: version đổi (bác sĩ khác vừa xử lý) → 0 dòng → 409. UpdateQueryBuilder tự tăng @VersionColumn.
      // Chuyển tuyến: assigned_doctor_id = NULL, bác sĩ này hết liên kết với ca.
      const res = await m
        .createQueryBuilder()
        .update(MedicalCase)
        .set({ status: escalate ? CaseStatus.ESCALATED : CaseStatus.REVIEWED, assignedDoctorId: escalate ? null : d.id })
        .where('id = :id AND version = :v AND status = :st', { id: caseId, v: dto.expectedVersion, st: CaseStatus.PENDING })
        .execute();
      if (!res.affected) throw conflict('Ca bệnh vừa được cập nhật ở nơi khác.', 'VERSION_CONFLICT');

      await m.insert(DoctorReview, {
        caseId,
        doctorId: d.id,
        decision: escalate ? ReviewDecision.ESCALATED : ReviewDecision.REVIEWED,
        notes: dto.notes.trim(),
        assessmentData: (dto.assessmentData ?? {}) as any,
      });

      if (escalate) {
        // Phiếu chỉ để bệnh nhân biết nơi được chuyển đến
        await m.insert(Referral, { caseId, fromDoctorId: d.id, toDoctorId: toDoctorId ?? null, toSpecialtyId: toSpecialtyId ?? null, reason: dto.notes.trim() });
      } else if (followUpAt) {
        await this.scheduling.reserve(m, {
          doctorId: d.id,
          patientId: c.patientId,
          caseId,
          scheduledAt: followUpAt,
          createdBy: AppointmentCreator.DOCTOR,
          note: 'Tái khám theo chỉ định của bác sĩ',
        });
      }

      await this.audit.log(
        { actorUserId: d.userId, action: 'review.created', entityType: 'case', entityId: caseId, metadata: { doctorId: d.id, decision: dto.status } },
        m,
      );
    });

    return { success: true, message: escalate ? 'Đã chuyển tuyến ca bệnh.' : 'Đã lưu kết luận.' };
  }

  private async assertReferralTarget(d: DoctorCtx, toDoctorId?: string, toSpecialtyId?: string) {
    if (!toDoctorId && !toSpecialtyId) throw new BadRequestException('Cần chọn bác sĩ hoặc khoa nhận khi chuyển tuyến');
    if (toDoctorId) {
      if (toDoctorId === d.id) throw new BadRequestException('Không thể chuyển tuyến cho chính mình');
      const ok = await this.ds.getRepository(DoctorProfile).exists({ where: { id: toDoctorId, isVerified: true } });
      if (!ok) throw new BadRequestException('Bác sĩ nhận không hợp lệ');
    }
    if (toSpecialtyId) {
      const ok = await this.ds.getRepository(Specialty).exists({ where: { id: toSpecialtyId, isActive: true } });
      if (!ok) throw new BadRequestException('Khoa nhận không hợp lệ');
    }
  }

  // ------------------------------------------------------------ đích chuyển tuyến (chỉ là nhãn hiển thị cho bệnh nhân)

  async getReferralTargets(d: DoctorCtx) {
    const [doctors, specialties] = await Promise.all([
      this.ds.getRepository(DoctorProfile).find({ where: { isVerified: true, id: Not(d.id) }, relations: { user: true } }),
      this.ds.getRepository(Specialty).find({ where: { isActive: true }, order: { name: 'ASC' } }),
    ]);
    return [
      ...doctors.map((x) => ({ kind: 'doctor' as const, id: x.id, label: `${doctorLabel(x)}${x.hospital ? ` – ${x.hospital}` : ''}` })),
      ...specialties.map((s) => ({ kind: 'specialty' as const, id: s.id, label: `Khoa ${s.name}` })),
    ];
  }

  // ------------------------------------------------------------ lịch (ủy quyền cho SchedulingService)

  getAvailability(d: DoctorCtx, weekStart: string) {
    return this.scheduling.getAvailability(d.id, weekStart);
  }
  setAvailability(d: DoctorCtx, dto: Parameters<SchedulingService['setAvailability']>[1]) {
    return this.scheduling.setAvailability(d.id, dto);
  }
  getAppointments(d: DoctorCtx) {
    return this.scheduling.doctorAppointments(d.id);
  }
}
