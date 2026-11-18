// src/patient/patient.service.ts
import 'multer';
import { randomUUID } from 'crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AiAnalysis } from '../Entity-User/AiAnalysis.entity.js';
import { Appointment, AppointmentStatus } from '../Entity-User/Appointment.entity.js';
import { CaseImage } from '../Entity-User/CaseImage.entity.js';
import { CaseStatus, MedicalCase } from '../Entity-User/MedicalCase.entity.js';
import { Gender, PatientProfile } from '../Entity-User/Patient.entity.js';
import { Specialty } from '../Entity-User/Specialty.entity.js';
import { AiAnalysisService } from '../case-support/ai-analysis.service.js';
import { AuditService } from '../case-support/audit.service.js';
import { INTAKE, IntakeDef, validateIntake } from '../case-support/intake-schema.js';
import { StorageService } from '../case-support/storage.service.js';
import { IMAGE_EXT, sniffImageMime } from '../common/image-type.util.js';
import { doctorLabel } from '../scheduling/scheduling.service.js';
import { QuotaCase, buildQuota } from './case-quota.util.js';

const isActive = (a: Appointment) => a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED;
const byNewest = <T extends { createdAt: Date }>(list: T[]) => [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

const toQuotaCases = (cases: MedicalCase[]): QuotaCase[] =>
  cases.map((c) => ({
    id: c.id,
    status: c.status,
    createdAt: c.createdAt,
    hasActiveAppointment: (c.appointments ?? []).some(isActive),
  }));

@Injectable()
export class PatientService {
  constructor(
    private readonly ds: DataSource,
    private readonly storage: StorageService,
    private readonly ai: AiAnalysisService,
    private readonly audit: AuditService,
  ) {}

  // ------------------------------------------------------------ lịch sử + hạn mức

  async getHistory(userId: string) {
    const cases = await this.ds.getRepository(MedicalCase).find({
      where: { patient: { userId } },
      relations: {
        specialty: true,
        reviews: { doctor: { user: true } },
        referrals: { toDoctor: { user: true }, toSpecialty: true },
        appointments: { doctor: { user: true } },
        images: { analyses: true },
      },
      order: { createdAt: 'DESC' },
    });

    const now = Date.now();
    const items = await Promise.all(cases.map(async (c) => {
      const review = byNewest(c.reviews)[0];
      const referral = c.status === CaseStatus.ESCALATED ? byNewest(c.referrals)[0] : undefined;
      const active = c.appointments.filter(isActive).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
      const appt = active.find((a) => a.scheduledAt.getTime() >= now) ?? active[active.length - 1];
      // Ca chuyển tuyến: bác sĩ cũ không còn liên kết với ca nên không trả tên/bệnh viện của họ
      const showDoctor = c.status !== CaseStatus.ESCALATED;

      return {
        id: c.id,
        submissionDate: c.createdAt.toISOString(),
        status: c.status,
        specialtyCode: c.specialty.code,
        specialtyName: c.specialty.name,
        review: review
          ? {
              decision: review.decision,
              notes: review.notes,
              reviewedAt: review.createdAt.toISOString(),
              doctorName: showDoctor ? doctorLabel(review.doctor) : null,
              hospital: showDoctor ? (review.doctor.hospital ?? null) : null,
            }
          : null,
        referral: referral
          ? {
              id: referral.id,
              reason: referral.reason,
              targetLabel: referral.toDoctor
                ? `${doctorLabel(referral.toDoctor)}${referral.toDoctor.hospital ? ` – ${referral.toDoctor.hospital}` : ''}`
                : referral.toSpecialty
                  ? `Khoa ${referral.toSpecialty.name}`
                  : null,
            }
          : null,
        appointment: appt
          ? {
              id: appt.id,
              scheduledAt: appt.scheduledAt.toISOString(),
              status: appt.status,
              doctorName: doctorLabel(appt.doctor),
              hospital: appt.doctor.hospital ?? null,
              note: appt.note ?? null,
            }
          : null,
        results: await Promise.all(c.images.map(async (image) => {
          const analysis = [...image.analyses].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
          return {
            imageUrl: await this.storage.signedUrl(image.storageKey),
            status: analysis?.status ?? null,
            riskScore: analysis?.riskScore ?? null,
            predictedLabel: analysis?.predictedLabel ?? null,
            gradcamUrl: analysis?.gradcamStorageKey ? await this.storage.signedUrl(analysis.gradcamStorageKey) : null,
          };
        })),
      };
    }));

    return { items, quota: buildQuota(toQuotaCases(cases)) };
  }

  // ------------------------------------------------------------ gửi hồ sơ

  async createPatientRecord(userId: string, files: Express.Multer.File[], body: Record<string, unknown>) {
    const def = INTAKE[typeof body.specialty === 'string' ? body.specialty : 'oncology'];
    if (!def) throw new BadRequestException('Chuyên khoa không hợp lệ');
    const intake = validateIntake(def, body);
    if (def.requiresImages && files.length === 0) throw new BadRequestException('Cần tải lên ít nhất 1 ảnh');

    const caseId = randomUUID();
    // Loại ảnh lấy từ nội dung thật, không tin mimetype client khai
    const uploads = files.map((file) => {
      const mime = sniffImageMime(file.buffer);
      if (!mime) throw new BadRequestException(`Tệp "${file.originalname.slice(0, 80)}" không phải ảnh JPEG, PNG hoặc WebP hợp lệ`);
      return { file, mime, key: `cases/${caseId}/images/${randomUUID()}.${IMAGE_EXT[mime]}` };
    });

    try {
      // Ảnh phải nằm trong bucket trước khi tạo ca vì FastAPI tự đọc theo khóa
      await Promise.all(uploads.map((u) => this.storage.put(u.key, u.file.buffer, u.mime)));

      const out = await this.ds.transaction(async (m) => {
        const profile = await this.lockOrCreateProfile(m, userId, String(intake.gender));
        const specialty = await this.ensureSpecialty(m, def);

        const existing = await m.find(MedicalCase, { where: { patientId: profile.id }, relations: { appointments: true } });
        const quota = buildQuota(toQuotaCases(existing));
        if (quota.blocked) {
          throw new ConflictException({
            message: 'Bạn đã dùng hết lượt gửi. Hãy xác nhận chuyển tuyến hoặc chờ hoàn tất lịch hẹn để giải phóng lượt.',
            code: 'QUOTA_BLOCKED',
          });
        }

        let evictedKeys: string[] = [];
        if (quota.eviction) {
          evictedKeys = await this.deleteCase(m, quota.eviction.caseId);
          await this.audit.log(
            { actorUserId: userId, action: 'case.evicted', entityType: 'case', entityId: quota.eviction.caseId, metadata: { reason: quota.eviction.reason } },
            m,
          );
        }

        await m.save(m.create(MedicalCase, { id: caseId, patientId: profile.id, specialtyId: specialty.id, intakeData: intake }));
        const images = await m.save(
          uploads.map((u) =>
            m.create(CaseImage, {
              caseId,
              kind: def.imageKind,
              storageKey: u.key,
              mimeType: u.mime,
              originalName: u.file.originalname.slice(0, 255),
              sizeBytes: u.file.size,
            }),
          ),
        );
        const analyses = def.aiEnabled ? await m.save(images.map((i) => m.create(AiAnalysis, { caseId, imageId: i.id }))) : [];
        await this.audit.log({ actorUserId: userId, action: 'case.created', entityType: 'case', entityId: caseId }, m);

        return {
          profileId: profile.id,
          quota,
          evictedKeys,
          jobs: analyses.map((a, i) => ({ analysisId: a.id, caseId, imageKey: images[i].storageKey, mimeType: images[i].mimeType })),
        };
      });

      this.ai.submit(out.jobs);
      void this.storage.removeMany(out.evictedKeys);

      return {
        profileId: out.profileId,
        diagnosisId: caseId,
        message: 'Gửi hồ sơ thành công!',
        evictedCaseId: out.quota.eviction?.caseId ?? null,
        evictedReason: out.quota.eviction?.reason ?? null,
      };
    } catch (err) {
      await this.storage.removeMany(uploads.map((u) => u.key));
      throw err;
    }
  }

  // ------------------------------------------------------------ xác nhận chuyển tuyến = xóa ca

  async confirmReferral(userId: string, caseId: string) {
    const keys = await this.ds.transaction(async (m) => {
      const c = await m.findOne(MedicalCase, { where: { id: caseId, patient: { userId } } });
      if (!c) throw new NotFoundException('Không tìm thấy hồ sơ');
      if (c.status !== CaseStatus.ESCALATED) throw new ConflictException('Chỉ xác nhận được hồ sơ đã chuyển tuyến');

      const k = await this.deleteCase(m, caseId);
      await this.audit.log({ actorUserId: userId, action: 'case.referral_confirmed', entityType: 'case', entityId: caseId }, m);
      return k;
    });

    void this.storage.removeMany(keys);
    return { deletedCaseId: caseId };
  }

  // ------------------------------------------------------------ nội bộ

  /** Xóa ca (CASCADE ảnh, AI, kết luận, phiếu chuyển tuyến; lịch hẹn giữ lại với case_id = NULL). Trả về các khóa S3 cần dọn sau commit. */
  private async deleteCase(m: EntityManager, caseId: string): Promise<string[]> {
    const [images, analyses] = await Promise.all([
      m.find(CaseImage, { where: { caseId }, select: { storageKey: true } }),
      m.find(AiAnalysis, { where: { caseId }, select: { gradcamStorageKey: true } }),
    ]);
    await m.delete(MedicalCase, { id: caseId });
    return [...images.map((i) => i.storageKey), ...analyses.map((a) => a.gradcamStorageKey)].filter((k): k is string => !!k);
  }

  /** Khóa dòng hồ sơ bệnh nhân để hai lần gửi đồng thời không vượt hạn mức */
  private async lockOrCreateProfile(m: EntityManager, userId: string, gender: string): Promise<PatientProfile> {
    const found = await m
      .createQueryBuilder(PatientProfile, 'p')
      .setLock('pessimistic_write')
      .where('p.userId = :userId', { userId })
      .getOne();
    if (found) return found;

    const g = (Object.values(Gender) as string[]).includes(gender) ? (gender as Gender) : Gender.OTHER;
    return m.save(m.create(PatientProfile, { userId, gender: g }));
  }

  private async ensureSpecialty(m: EntityManager, def: IntakeDef): Promise<Specialty> {
    const found = await m.findOne(Specialty, { where: { code: def.code } });
    if (found) {
      if (!found.isActive) throw new BadRequestException('Chuyên khoa hiện không nhận hồ sơ');
      return found;
    }
    return m.save(m.create(Specialty, { code: def.code, name: def.name }));
  }
}
