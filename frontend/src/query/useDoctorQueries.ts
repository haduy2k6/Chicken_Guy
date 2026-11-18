"use client";

import { useCallback } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { doctorService } from "@/src/features/doctor/doctor.service";
import type {
  DoctorCaseDetail,
  DoctorQueueParams,
  DoctorQueueResponse,
  ReviewCaseRequest,
  ReviewCaseResult,
} from "@/src/features/doctor/types";
import { useAuthStore } from "@/src/stores/authStore";
import { useDoctorStore } from "@/src/stores/doctorStore";

export const SIGNED_URL_TTL_MS = 15 * 60 * 1000;
const CASE_DETAIL_STALE_MS = 60 * 1000;
const CASE_DETAIL_GC_MS = 2 * 60 * 1000;

if (process.env.NODE_ENV !== "production" && SIGNED_URL_TTL_MS <= CASE_DETAIL_STALE_MS + CASE_DETAIL_GC_MS) {
  console.warn("[useDoctorQueries] TTL signed URL phải lớn hơn staleTime + gcTime của detail");
}

function useDoctorAccess() {
  const userId = useAuthStore((s) => (s.authReady && s.user?.role === "doctor" ? s.user.userId : ""));
  return { userId, enabled: userId !== "" };
}

/** Không cần realtime: danh sách chỉ làm mới khi mở lại, đổi bộ lọc hoặc bấm "Làm mới" */
export function useDoctorQueueQuery() {
  const { userId, enabled } = useDoctorAccess();
  const status = useDoctorStore((s) => s.filterStatus);
  const specialty = useDoctorStore((s) => s.filterSpecialty);
  const params: DoctorQueueParams = { status, specialty };

  return useQuery<DoctorQueueResponse, Error>({
    queryKey: queryKeys.doctor.queue(userId, params),
    queryFn: ({ signal }) => doctorService.getPatientQueue(params, signal),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useDoctorCaseDetailQuery(caseId: string | null) {
  const { userId, enabled } = useDoctorAccess();

  return useQuery<DoctorCaseDetail, Error>({
    queryKey: queryKeys.doctor.caseDetail(userId, caseId ?? ""),
    queryFn: ({ signal }) => doctorService.getCaseDetail(caseId as string, signal),
    enabled: enabled && !!caseId,
    staleTime: CASE_DETAIL_STALE_MS,
    gcTime: CASE_DETAIL_GC_MS,
    refetchInterval: false,
  });
}

export function usePrefetchDoctorCase() {
  const queryClient = useQueryClient();
  const { userId, enabled } = useDoctorAccess();

  return useCallback(
    (caseId: string) => {
      if (!enabled) return;
      void queryClient.prefetchQuery({
        queryKey: queryKeys.doctor.caseDetail(userId, caseId),
        queryFn: ({ signal }) => doctorService.getCaseDetail(caseId, signal),
        staleTime: CASE_DETAIL_STALE_MS,
        gcTime: CASE_DETAIL_GC_MS,
      });
    },
    [queryClient, userId, enabled]
  );
}

export interface ReviewCasePayload {
  caseId: string;
  status: "reviewed" | "escalated";
  notes: string;
  expectedVersion: number;
  assessmentData?: Record<string, unknown>;
  /** Giữ để tương thích với panel hiện tại; backend không dùng */
  assessmentFormVersion?: number;
  followUpDate?: string;
  referral?: { toDoctorId?: string; toSpecialtyId?: string };
}

function toIsoFromLocalInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Ngày hẹn không hợp lệ");
  return date.toISOString();
}

function getHttpStatus(err: unknown): number | undefined {
  const status = (err as { response?: { status?: number } } | null)?.response?.status;
  return typeof status === "number" ? status : undefined;
}

export function useReviewCaseMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.userId ?? "");

  return useMutation<ReviewCaseResult, Error, ReviewCasePayload>({
    mutationFn: async (p) => {
      if (p.status === "escalated" && !p.referral?.toDoctorId && !p.referral?.toSpecialtyId) {
        throw new Error("Cần chọn bác sĩ hoặc khoa nhận khi chuyển tuyến");
      }
      const body: ReviewCaseRequest = {
        status: p.status,
        notes: p.notes.trim(),
        expectedVersion: p.expectedVersion,
        ...(p.assessmentData ? { assessmentData: p.assessmentData } : {}),
        ...(p.status === "reviewed" && p.followUpDate ? { followUpAt: toIsoFromLocalInput(p.followUpDate) } : {}),
        ...(p.status === "escalated" && p.referral ? { referral: p.referral } : {}),
      };
      return doctorService.reviewPatientCase(p.caseId, body);
    },

    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctor.queueRoot(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctor.caseDetail(userId, v.caseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctor.appointments(userId) });
    },

    onError: (err, v) => {
      if (getHttpStatus(err) === 409) {
        queryClient.invalidateQueries({ queryKey: queryKeys.doctor.queueRoot(userId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.doctor.caseDetail(userId, v.caseId) });
      }
    },
  });
}
