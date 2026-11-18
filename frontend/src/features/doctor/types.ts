export type SpecialtyCode = "oncology" | "nephrology" | "cardiology";
export type SpecialtyFilter = "all" | SpecialtyCode;
export type CaseStatus = "pending" | "reviewed" | "escalated";
export type StatusFilter = "all" | CaseStatus;
export type Gender = "Male" | "Female" | "Other";
export type AiStatus = "processing" | "completed" | "failed";

export const GENDER_LABEL: Record<Gender, string> = { Male: "Nam", Female: "Nữ", Other: "Khác" };

export interface ReviewDraft {
  notes: string;
  status: "reviewed" | "escalated";
  followUpDate?: string;
  assessmentData?: Record<string, unknown>;
  assessmentFormVersion?: number;
  referral?: { toDoctorId?: string; toSpecialtyId?: string };
}

export interface PatientQueueItem {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  specialty: SpecialtyCode;
  submissionDate: string;
  aiRiskScore: number | null;
  aiStatus: AiStatus;
  status: CaseStatus;
}

export interface DoctorQueueParams {
  status: StatusFilter;
  specialty: SpecialtyFilter;
}

export interface DoctorQueueResponse {
  items: PatientQueueItem[];
  pendingCount: number;
}

export interface CaseImageDto {
  id: string;
  kind: "endoscopy" | "document" | "other";
  thumbUrl: string | null;
  url: string; // signed URL ngắn hạn
  analysis?: {
    status: AiStatus;
    riskScore: number | null;
    predictedLabel: string | null;
    gradcamUrl: string | null;
  };
}

export interface DoctorCaseDetail extends PatientQueueItem {
  version: number;
  symptoms: string[];
  patientNote: string | null;
  intakeData: Record<string, unknown>;
  intakeFormVersion: number;
  assessmentFormVersion: number;
  images: CaseImageDto[];
}

export interface ReviewCaseRequest {
  status: "reviewed" | "escalated";
  notes: string;
  expectedVersion: number;
  assessmentData?: Record<string, unknown>;
  followUpAt?: string;
  referral?: { toDoctorId?: string; toSpecialtyId?: string };
}

export interface ReviewCaseResult {
  success: boolean;
  message: string;
}
