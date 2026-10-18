// src/hooks/usePatientApi.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../Axios/axios.config";

export interface PatientSubmissionPayload {
  files: File[];
  formValues: Record<string, string>;
}

export const PATIENT_HISTORY_QUERY_KEY = ["patient", "history"] as const;

export function useSubmitPatientData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ files, formValues }: PatientSubmissionPayload) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      Object.entries(formValues).forEach(([key, val]) => formData.append(key, val));

      // Post using axiosClient with automatic auth header and multipart handling
      const response = await axiosClient.post("/patient", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_HISTORY_QUERY_KEY });
    },
  });
}

export function usePatientHistory() {
  return useQuery({
    queryKey: PATIENT_HISTORY_QUERY_KEY,
    queryFn: async () => {
      const res = await axiosClient.get("/patient/history");
      return res.data;
    },
    // Don't fetch unless enabled or configured
    enabled: false,
  });
}
