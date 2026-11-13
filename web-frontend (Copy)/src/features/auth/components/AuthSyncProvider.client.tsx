"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import { UserUI } from "@/src/StoreUser/Global/UserUI";
import { usePatientStore } from "@/src/StoreUser/Patient/PatientStore";
import { authChannel } from "@/src/StoreUser/Global/authChannel";
import { authService } from "../services/auth.service";
import { RouteManager } from "@/src/config/routes.config";
import { getQueryClient } from "@/src/Tanstackquery/tanstackConfig";

export function AuthSyncProvider({
  children,
  currentLocale,
}: {
  children: React.ReactNode;
  currentLocale?: string;
}) {
  const isSessionChecked = useRef(false);

  useEffect(() => {
    if (currentLocale) {
      UserUI.getState().syncFromLocale(currentLocale);
    }
  }, [currentLocale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const queryClient = getQueryClient();

    const unsubscribe = authChannel.subscribe((event) => {
      switch (event.type) {
        case "AUTH_LOGIN":
          useAuthStore.getState().setAuth(event.payload, false);
          queryClient.invalidateQueries();
          break;

        case "AUTH_LOGOUT":
          useAuthStore.getState().clearAuth(false);
          usePatientStore.getState().clearUserSession();
          queryClient.clear();
          queryClient.removeQueries();

          if (typeof window !== "undefined") {
            const pathname = window.location.pathname;
            if (RouteManager.isProtectedRoute(pathname)) {
              const lang = UserUI.getState().language || "vi";
              window.location.href = RouteManager.getLocalizedPath(RouteManager.PAGES.HOME, lang);
            }
          }
          break;

        case "AUTH_TOKEN_REFRESHED":
          useAuthStore.getState().setAccessToken(event.payload.accessToken, false);
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isSessionChecked.current) return;
    isSessionChecked.current = true;

    const handleUrlToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");

      if (tokenFromUrl) {
        urlParams.delete("token");
        const remainingQuery = urlParams.toString();
        const cleanUrl = `${window.location.pathname}${
          remainingQuery ? `?${remainingQuery}` : ""
        }`;
        window.history.replaceState({}, document.title, cleanUrl);

        useAuthStore.getState().setAuth({ accessToken: tokenFromUrl }, true);

        try {
          const profile = await authService.getMe();
          useAuthStore.getState().setUser(profile);
        } catch {}
        return true;
      }
      return false;
    };

    const initSession = async () => {
      const hasTokenFromUrl = await handleUrlToken();
      if (hasTokenFromUrl) {
        useAuthStore.getState().setInitialized(true);
        return;
      }

      const currentToken = useAuthStore.getState().accessToken;
      if (!currentToken) {
        try {
          const data = await authService.refreshToken();
          if (data?.accessToken) {
            useAuthStore
              .getState()
              .setAuth({ accessToken: data.accessToken, role: data.role }, false);

            try {
              const profile = await authService.getMe();
              useAuthStore.getState().setUser(profile);
            } catch {}
          }
        } catch {
          if (useAuthStore.getState().isSignIn) {
            useAuthStore.getState().clearAuth(false);
          }
        }
      }

      useAuthStore.getState().setInitialized(true);
    };

    initSession();
  }, []);

  return <>{children}</>;
}

export default AuthSyncProvider;
