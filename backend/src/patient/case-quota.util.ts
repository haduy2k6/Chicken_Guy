// src/patient/case-quota.util.ts
import { CaseStatus } from '../Entity-User/MedicalCase.entity.js';

/** Mỗi bệnh nhân tối đa 4 yêu cầu khám (tổng các khoa). Muốn tính theo từng khoa: lọc `cases` theo specialtyId trước khi gọi. */
export const MAX_CASES_PER_PATIENT = 4;

export type EvictionReason = 'reviewed' | 'newest_pending';

export interface QuotaCase {
  id: string;
  status: CaseStatus;
  createdAt: Date;
  hasActiveAppointment: boolean;
}

export interface Quota {
  used: number;
  max: number;
  remaining: number;
  eviction: { caseId: string; reason: EvictionReason } | null;
  blocked: boolean;
}

/**
 * Khi đủ 4 ca:
 * - xóa ca ĐÃ DUYỆT cũ nhất (bỏ qua ca còn lịch hẹn hiệu lực)
 * - không có thì xóa ca ĐANG CHỜ mới nhất (LIFO)
 * - còn lại (toàn ca chuyển tuyến chờ xác nhận, hoặc ca đã duyệt còn lịch hẹn) -> chặn
 * Ca chuyển tuyến chỉ biến mất khi bệnh nhân xác nhận.
 */
export function buildQuota(cases: QuotaCase[]): Quota {
  const used = cases.length;
  const base = { used, max: MAX_CASES_PER_PATIENT, remaining: Math.max(0, MAX_CASES_PER_PATIENT - used) };
  if (used < MAX_CASES_PER_PATIENT) return { ...base, eviction: null, blocked: false };

  const t = (c: QuotaCase) => c.createdAt.getTime();

  const reviewed = cases
    .filter((c) => c.status === CaseStatus.REVIEWED && !c.hasActiveAppointment)
    .sort((a, b) => t(a) - t(b))[0];
  if (reviewed) return { ...base, eviction: { caseId: reviewed.id, reason: 'reviewed' }, blocked: false };

  const pending = cases.filter((c) => c.status === CaseStatus.PENDING).sort((a, b) => t(b) - t(a))[0];
  if (pending) return { ...base, eviction: { caseId: pending.id, reason: 'newest_pending' }, blocked: false };

  return { ...base, eviction: null, blocked: true };
}
