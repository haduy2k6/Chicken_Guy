export type CaseStatus = "pending" | "reviewed" | "escalated";
export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "completed" | "no_show";
export type EvictionReason = "reviewed" | "newest_pending";

export interface PatientSubmissionPayload {
  specialty: string;
  files: File[];
  formValues: Record<string, string>;
}

export interface PatientSubmissionResponse {
  profileId: string;
  diagnosisId: string;
  message?: string;
  evictedCaseId?: string | null;
  evictedReason?: EvictionReason | null;
}

export interface PatientHistoryReview {
  decision: "reviewed" | "escalated";
  notes: string;
  reviewedAt: string;
  doctorName: string | null;
  hospital: string | null;
}

export interface PatientHistoryReferral {
  id: string;
  reason: string;
  targetLabel: string | null;
}

export interface PatientHistoryAppointment {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  doctorName: string | null;
  hospital: string | null;
  note: string | null;
}

export interface PatientHistoryItem {
  id: string;
  submissionDate: string;
  status: CaseStatus;
  specialtyCode: string | null;
  specialtyName: string | null;
  review: PatientHistoryReview | null;
  referral: PatientHistoryReferral | null;
  appointment: PatientHistoryAppointment | null;
  results: Array<{
    imageUrl: string;
    status: "processing" | "completed" | "failed" | null;
    riskScore: number | null;
    predictedLabel: string | null;
    gradcamUrl: string | null;
  }>;
}

/** Hạn mức do backend tính (nguồn sự thật duy nhất) */
export interface QuotaState {
  used: number;
  max: number;
  remaining: number;
  eviction: { caseId: string; reason: EvictionReason } | null;
  blocked: boolean;
}

export interface PatientHistoryResponse {
  items: PatientHistoryItem[];
  quota: QuotaState;
}

export interface ConfirmReferralResponse {
  deletedCaseId: string;
}
