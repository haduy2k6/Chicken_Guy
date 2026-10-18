// src/hooks/useCurrentUser.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { userAuth } from "../Store/useAuthStore";
import { authService, UserProfile } from "../Services/auth.service";

export const USER_PROFILE_QUERY_KEY = ["user", "profile"] as const;

export function useCurrentUser() {
  const isSignIn = userAuth((s) => s.isSignIn);
  const accessToken = userAuth((s) => s.accessToken);
  const userId = userAuth((s) => s.user?.userId);

  return useQuery<UserProfile, Error>({
    queryKey: [...USER_PROFILE_QUERY_KEY, userId || "anonymous"],
    queryFn: () => authService.getMe(),
    enabled: isSignIn && !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}
