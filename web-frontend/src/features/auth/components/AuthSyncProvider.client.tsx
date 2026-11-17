"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, UserSession } from "@/src/StoreUser/Global/AuthStore";
import { UserUI } from "@/src/StoreUser/Global/UserUI";
import { usePatientStore } from "@/src/StoreUser/Patient/PatientStore";
import { useDoctorStore } from "@/src/StoreUser/Doctor/DoctorStore";
import { authChannel } from "@/src/StoreUser/Global/authChannel";
import { authService } from "../services/auth.service";
import { getQueryClient } from "@/src/Tanstackquery/tanstackConfig";

type Role = "patient" | "doctor";

const normalizeRole = (role?: string | null): Role =>
  role === "doctor" ? "doctor" : "patient";

function decodeJwt(token: string): {
  sub?: string;
  role?: string;
  name?: string;
  email?: string;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

async function loginWithToken(
  accessToken: string,
  hint?: { role?: string | null; name?: string | null; email?: string | null; avatar?: string | null }
): Promise<void> {
  const decoded = decodeJwt(accessToken);
  const initialRole = normalizeRole(hint?.role || decoded?.role);
  const initialName = hint?.name || decoded?.name || (decoded?.email ? decoded.email.split("@")[0] : "");
  const initialEmail = hint?.email || decoded?.email;
  const initialUserId = decoded?.sub || "user";
  const initialAvatar = hint?.avatar?? undefined;

  useAuthStore.getState().setLogin({
    accessToken,
    role: initialRole,
    name: initialName,
    email: initialEmail,
    avatar: initialAvatar,
    userId: initialUserId,
    user: {
      userId: initialUserId,
      role: initialRole,
      name: initialName,
      email: initialEmail,
      avatar: initialAvatar,
    },
  });

  try {
    const profile = await authService.getMe();
    if (profile) {
      useAuthStore.getState().setUser({
        userId: profile.userId || initialUserId,
        role: normalizeRole(profile.role || initialRole),
        name: profile.name || initialName,
        email: profile.email || initialEmail,
        avatar: profile.avatar ||initialAvatar,
      });
    }
  } catch (err) {
    console.warn("[AuthSyncProvider] getMe fetch note:", err);
  }
}

export function AuthSyncProvider({
  children,
  currentLocale,
}: {
  children: React.ReactNode;
  currentLocale?: string;
}) {
  const isSessionChecked = useRef(false);
  useEffect(() => {
  useAuthStore.getState().hydrate();
}, []);

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
          queryClient.invalidateQueries();
          break;

        case "AUTH_LOGOUT":
          usePatientStore.getState().clearUserSession();
          useDoctorStore.getState().clearDoctorSession();
          queryClient.clear();
          queryClient.removeQueries();
          break;

        case "AUTH_TOKEN_REFRESHED":
          queryClient.invalidateQueries();
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

    const handleUrlToken = async (): Promise<boolean> => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl =
        urlParams.get("token") ||
        urlParams.get("accessToken") ||
        urlParams.get("access_token");

      if (!tokenFromUrl) return false;
      urlParams.delete("token");
      urlParams.delete("accessToken");
      urlParams.delete("access_token");
      const remainingQuery = urlParams.toString();
      const cleanUrl = `${window.location.pathname}${
        remainingQuery ? `?${remainingQuery}` : ""
      }${window.location.hash}`;
      window.history.replaceState({}, document.title, cleanUrl);

      await loginWithToken(tokenFromUrl);
      return true;
    };

    const initSession = async () => {
      try {
        const handled = await handleUrlToken();
        if (handled) return;
        const existingToken = useAuthStore.getState().accessToken;
        if (existingToken) {
          try {
            const profile = await authService.getMe();
            if (profile) {
              useAuthStore.getState().setUser({
                userId: profile.userId,
                role: normalizeRole(profile.role),
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar,
              });
            }
            return;
          } catch {
          }
        }

        try {
          const data = await authService.refreshToken();
          if (data?.accessToken) {
            await loginWithToken(data.accessToken, {
              role: data.role,
              name: data.name,
              email: data.email,
              avatar: data.avatar,
            });
          }
        } catch {
          if (useAuthStore.getState().isLogin) {
            useAuthStore.getState().setLogout();
          }
        }
      } catch (err) {
        console.error("[AuthSyncProvider] initSession error:", err);
      }
    };

    initSession();
  }, []);

  return <>{children}</>;
}

export default AuthSyncProvider;
