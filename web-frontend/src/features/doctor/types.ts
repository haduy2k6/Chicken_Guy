export type SpecialtyFilter = "all" | "cancer" | "kidney" | "cardiology";

export interface PatientQueueItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  specialty: SpecialtyFilter;
  submissionDate: string;
  aiRiskScore?: number;
  status: "pending" | "reviewed" | "escalated";
}
