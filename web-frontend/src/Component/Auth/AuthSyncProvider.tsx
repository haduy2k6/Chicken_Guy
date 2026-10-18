// src/Component/Auth/AuthSyncProvider.tsx
"use client";

import { useEffect, useRef } from "react";
import { userAuth } from "@/src/Store/useAuthStore";
import { userTheme } from "@/src/Store/userThemeStore";
import { usePatientStore } from "@/src/Store/usePatientStore";
import { authChannel } from "@/src/Store/authChannel";
import { authService } from "@/src/Services/auth.service";
import { getQueryClient } from "@/src/Tanstackquery/tanstackConfig";

export default function AuthSyncProvider({
  children,
  currentLocale,
}: {
  children: React.ReactNode;
  currentLocale?: string;
}) {
  const isSessionChecked = useRef(false);

  // 1. Sync locale from URL params to Zustand store
  useEffect(() => {
    if (currentLocale) {
      userTheme.getState().syncFromLocale(currentLocale);
    }
  }, [currentLocale]);

  // 2. Cross-tab event listener - ALWAYS stays subscribed across React lifecycle/StrictMode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const queryClient = getQueryClient();

    const unsubscribe = authChannel.subscribe((event) => {
      switch (event.type) {
        case "AUTH_LOGIN":
          userAuth.getState().setAuth(event.payload, false);
          queryClient.invalidateQueries();
          break;

        case "AUTH_LOGOUT":
          // When logout is received from another tab, immediately clear state, wipe files & cache
          userAuth.getState().clearAuth(false);
          usePatientStore.getState().clearUserSession();
          queryClient.clear();
          queryClient.removeQueries();

          // If current tab is on protected route, redirect to home
          if (typeof window !== "undefined") {
            const pathname = window.location.pathname;
            if (pathname.includes("/patient") || pathname.includes("/doctor")) {
              const lang = userTheme.getState().language || "vi";
              window.location.href = `/${lang}`;
            }
          }
          break;

        case "AUTH_TOKEN_REFRESHED":
          userAuth.getState().setAccessToken(event.payload.accessToken, false);
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 3. Initial Session Check (runs only once per tab instance)
  useEffect(() => {
    if (typeof window === "undefined" || isSessionChecked.current) return;
    isSessionChecked.current = true;

    // Check for OAuth callback token in URL query params
    const handleUrlToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");

      if (tokenFromUrl) {
        urlParams.delete("token");
        const remainingQuery = urlParams.toString();
        const cleanUrl = `${window.location.pathname}${remainingQuery ? `?${remainingQuery}` : ""}`;
        window.history.replaceState({}, document.title, cleanUrl);

        // setAuth automatically decodes JWT for sub (userId) and role
        userAuth.getState().setAuth({ accessToken: tokenFromUrl }, true);

        try {
          const profile = await authService.getMe();
          userAuth.getState().setUser(profile);
        } catch (err) {
          console.error("Failed to fetch user profile after OAuth redirect", err);
        }
        return true;
      }
      return false;
    };

    const initSession = async () => {
      const hasTokenFromUrl = await handleUrlToken();
      if (hasTokenFromUrl) {
        userAuth.getState().setInitialized(true);
        return;
      }

      // If no token in memory, attempt silent refresh using httpOnly refreshToken cookie
      const currentToken = userAuth.getState().accessToken;
      if (!currentToken) {
        try {
          const data = await authService.refreshToken();
          if (data?.accessToken) {
            userAuth.getState().setAuth({ accessToken: data.accessToken, role: data.role }, false);

            try {
              const profile = await authService.getMe();
              userAuth.getState().setUser(profile);
            } catch {
              // Ignore getMe error if silent refresh succeeded
            }
          }
        } catch {
          if (userAuth.getState().isSignIn) {
            userAuth.getState().clearAuth(false);
          }
        }
      }

      userAuth.getState().setInitialized(true);
    };

    initSession();
  }, []);

  return <>{children}</>;
}
