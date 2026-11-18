"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { patientService } from "@/src/features/patient/patient.service";
import type {
  ConfirmReferralResponse,
  PatientHistoryResponse,
  PatientSubmissionPayload,
  PatientSubmissionResponse,
  QuotaState,
} from "@/src/features/patient/types";
import { syncBus } from "@/src/core/broadcastChannel";
import { useAuthStore } from "@/src/stores/authStore";

function usePatientAccess() {
  const userId = useAuthStore((s) => s.user?.userId ?? "");
  return { userId, enabled: userId !== "" };
}

export function usePatientHistoryQuery() {
  const { userId, enabled } = usePatientAccess();

  return useQuery<PatientHistoryResponse, Error>({
    queryKey: queryKeys.patient.history(userId),
    queryFn: ({ signal }) => patientService.getHistory(signal),
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: (query) =>
      query.state.data?.items.some((item) => item.results.some((result) => result.status === "processing"))
        ? 5_000
        : false,
  });
}

export const usePatientHistory = usePatientHistoryQuery;

const NO_QUOTA: QuotaState = { used: 0, max: 0, remaining: 0, eviction: null, blocked: false };

/** Hạn mức lấy thẳng từ backend (kèm lịch sử), không tính lại ở client */
export function usePatientQuota() {
  const { data, isLoading } = usePatientHistoryQuery();
  return useMemo(() => ({ ...(data?.quota ?? NO_QUOTA), isLoading, known: data !== undefined }), [data, isLoading]);
}

export function useSubmitPatientMutation() {
  const queryClient = useQueryClient();

  return useMutation<PatientSubmissionResponse, Error, PatientSubmissionPayload>({
    mutationFn: (payload) => patientService.submitScreeningData(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patient.all });
      syncBus.broadcast({ type: "PATIENT_SUBMITTED", payload: { message: res.message || "Đã gửi hồ sơ sàng lọc thành công!" } });
    },
  });
}

export const useSubmitPatientData = useSubmitPatientMutation;

type ConfirmCtx = { previous?: PatientHistoryResponse; key: readonly string[] };

/** Xác nhận chuyển tuyến = ca bị xóa: gỡ ngay khỏi danh sách (lạc quan), lỗi thì khôi phục */
export function useConfirmReferralMutation() {
  const queryClient = useQueryClient();
  const { userId } = usePatientAccess();

  return useMutation<ConfirmReferralResponse, Error, string, ConfirmCtx>({
    mutationFn: (caseId) => patientService.confirmReferral(caseId),

    onMutate: async (caseId) => {
      const key = queryKeys.patient.history(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PatientHistoryResponse>(key);
      queryClient.setQueryData<PatientHistoryResponse>(key, (old) =>
        old ? { ...old, items: old.items.filter((i) => i.id !== caseId) } : old
      );
      return { previous, key };
    },

    onError: (_err, _caseId, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(ctx.key, ctx.previous);
    },

    // Làm mới để lấy lại hạn mức chính xác từ backend
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.patient.history(userId) }),
  });
}
