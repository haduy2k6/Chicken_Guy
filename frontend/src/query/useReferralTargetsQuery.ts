"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/src/config/routes.config";
import { http } from "@/src/core/httpClient";
import { useAuthStore } from "@/src/stores/authStore";
import { queryKeys } from "./queryKeys";

export interface ReferralTarget {
  kind: "doctor" | "specialty";
  id: string; 
  label: string;
}

export function useReferralTargetsQuery(enabled: boolean) {
  const userId = useAuthStore((s) => s.user?.userId ?? "");

    return useQuery<ReferralTarget[], Error>({
    queryKey: queryKeys.doctor.referralTargets(userId),
    queryFn: ({ signal }) =>
      http.get<ReferralTarget[]>(API_ROUTES.DOCTOR.REFERRAL_TARGETS, { signal }),
    enabled: enabled && userId !== "",
    staleTime: 10 * 60 * 1000,
  });
}
