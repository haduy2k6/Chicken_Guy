"use client";

import { queryKeys } from "@/src/query/queryKeys";

export {
  usePatientHistoryQuery,
  usePatientHistory,
  usePatientQuota,
  useSubmitPatientMutation,
  useSubmitPatientData,
  useConfirmReferralMutation,
} from "@/src/query/usePatientQueries";

export { queryKeys } from "@/src/query/queryKeys";

export const PATIENT_HISTORY_QUERY_KEY = queryKeys.patient.history();