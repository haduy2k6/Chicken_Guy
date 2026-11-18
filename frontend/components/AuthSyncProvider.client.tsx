"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUiStore } from "@/src/stores/uiStore";
import { syncAuthStore } from "@/src/stores/authStore";
import { syncBus } from "@/src/core/broadcastChannel";
import { http } from "@/src/core/httpClient";
import { useSessionQuery, clearSession } from "@/src/query/useSessionQuery";
import { queryKeys } from "@/src/query/queryKeys";

export function AuthSyncProvider({ children, currentLocale }: { children: React.ReactNode; currentLocale?: string }) {
  const qc = useQueryClient();
  const { data: session, isPending } = useSessionQuery();
  const hadSession = useRef(false);

  useEffect(() => {
    if (currentLocale) useUiStore.getState().syncFromLocale(currentLocale);
  }, [currentLocale]);

  // Backend redirect về ?auth=success sau khi đăng nhập Google: nạp session, dọn URL, báo cho các tab khác
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("auth") !== "success") return;

    url.searchParams.delete("auth");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    qc.invalidateQueries({ queryKey: queryKeys.auth.session() });
    syncBus.broadcast({ type: "AUTH_LOGIN" });
  }, [qc]);

  useEffect(() => {
    http.setSessionExpiredHandler(() => clearSession({ qc, broadcast: true }));
    return () => http.setSessionExpiredHandler(null);
  }, [qc]);

  useEffect(
    () =>
      syncBus.subscribe((event) => {
        switch (event.type) {
          case "AUTH_LOGOUT":
            void clearSession({ qc, broadcast: false });
            break;
          case "AUTH_LOGIN": // tab khác vừa đăng nhập: cookie refresh đã có, nạp lại session
            qc.invalidateQueries({ queryKey: queryKeys.auth.session() });
            break;
          case "AUTH_TOKEN_REFRESHED":
            if (!qc.getQueryData(queryKeys.auth.session())) qc.invalidateQueries({ queryKey: queryKeys.auth.session() });
            break;
          case "PATIENT_SUBMITTED": // tab khác của cùng bệnh nhân vừa gửi hồ sơ
            qc.invalidateQueries({ queryKey: queryKeys.patient.history() });
            break;
        }
      }),
    [qc]
  );

  useEffect(() => {
    if (session) {
      hadSession.current = true;
    } else if (session === null && hadSession.current) {
      hadSession.current = false;
      void clearSession({ qc, broadcast: false });
    }
    syncAuthStore(session ?? null, !isPending);
  }, [session, isPending, qc]);

  return <>{children}</>;
}

export default AuthSyncProvider;
