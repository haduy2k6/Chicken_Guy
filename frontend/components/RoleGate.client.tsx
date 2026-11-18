"use client";

import { useEffect } from "react";
import { useRouter } from "@/src/i18n/routing";
import { APP_ROUTES, homeFor } from "@/src/config/routes.config";
import { useAuthStore } from "@/src/stores/authStore";
import { useUiStore } from "@/src/stores/uiStore";
import type { Role } from "@/src/core/httpClient";

/**
 * Lớp chặn phía client dựa trên session thật (authStore), bổ sung cho middleware (chỉ nhìn cookie).
 * Xử lý cả trường hợp session đổi ở tab khác (đăng xuất, đổi vai trò).
 * Dùng: <RoleGate role="doctor"> ở trang /doctor, <RoleGate role="patient"> ở /appointments,
 * <RoleGate role="patient" allowGuest> ở /patient.
 */
export function RoleGate({ role, allowGuest = false, children }: { role: Role; allowGuest?: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.authReady);
  const setSignInPopUp = useUiStore((s) => s.setSignInPopUp);

  const allowed = user ? user.role === role : allowGuest;

  useEffect(() => {
    if (!ready || allowed) return;
    if (!user) {
      setSignInPopUp(true);
      router.replace(APP_ROUTES.HOME);
    } else {
      router.replace(homeFor(user.role));
    }
  }, [ready, allowed, user, router, setSignInPopUp]);

  if (!ready || !allowed) return null;
  return <>{children}</>;
}

export default RoleGate;
