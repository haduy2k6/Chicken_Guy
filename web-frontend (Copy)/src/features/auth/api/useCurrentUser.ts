"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import { authService } from "../services/auth.service";
import { UserProfileResponse } from "../types";

export const USER_PROFILE_QUERY_KEY = ["user", "profile"] as const;

export function useCurrentUser() {
  const isSignIn = useAuthStore((s) => s.isSignIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.userId);

  return useQuery<UserProfileResponse, Error>({
    queryKey: [...USER_PROFILE_QUERY_KEY, userId || "anonymous"],
    queryFn: () => authService.getMe(),
    enabled: isSignIn && !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}
