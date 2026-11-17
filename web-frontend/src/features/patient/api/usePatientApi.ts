"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../services/patient.service";
import { PatientSubmissionPayload, PatientHistoryItem } from "../types";

export const PATIENT_HISTORY_QUERY_KEY = ["patient", "history"] as const;

export function useSubmitPatientData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatientSubmissionPayload) =>
      patientService.submitScreeningData(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_HISTORY_QUERY_KEY });
    },
  });
}

export function usePatientHistory() {
  return useQuery<PatientHistoryItem[], Error>({
    queryKey: PATIENT_HISTORY_QUERY_KEY,
    queryFn: () => patientService.getHistory(),
    enabled: false,
  });
}
