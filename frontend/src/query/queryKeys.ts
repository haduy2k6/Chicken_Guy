import type { DoctorQueueParams } from "@/src/features/doctor/types";

export const queryKeys = {
  auth: {
    session: () => ["auth", "session"] as const,
  },
  patient: {
    all: ["patient"] as const,
    history: (userId?: string): readonly string[] =>
      userId === undefined ? ["patient", "history"] : ["patient", "history", userId],
    doctors: (caseId: string, date: string) => ["patient", "doctors", caseId, date] as const,
  },
  doctors: {
    list: ["doctors"] as const,
  },
  doctor: {
    queueRoot: (userId: string) => ["doctor", userId, "queue"] as const,
    queue: (userId: string, params: DoctorQueueParams) => ["doctor", userId, "queue", params] as const,
    caseDetail: (userId: string, caseId: string) => ["doctor", userId, "case", caseId] as const,
    referralTargets: (userId: string) => ["doctor", userId, "referral-targets"] as const,
    availability: (userId: string, weekStart: string) => ["doctor", userId, "availability", weekStart] as const,
    appointments: (userId: string) => ["doctor", userId, "appointments"] as const,
  },
} as const;
