"use client";

import { useMutation, useQuery, type QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { API_ROUTES } from "@/src/config/routes.config";
import { getQueryClient } from "./queryClient";
import { http, setAccessToken, type Session } from "@/src/core/httpClient";
import { syncBus } from "@/src/core/broadcastChannel";
import { usePatientStore } from "@/src/stores/patientStore";
import { useDoctorStore } from "@/src/stores/doctorStore";
import { useUiStore } from "@/src/stores/uiStore";
import { appDb } from "../core/indexedDb";

const SESSION_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function useSessionQuery() {
  return useQuery<Session | null>({
    queryKey: queryKeys.auth.session(),
    queryFn: () => http.refreshSession(),
    staleTime: SESSION_REFRESH_INTERVAL_MS,
    refetchInterval: (query) => (query.state.data ? SESSION_REFRESH_INTERVAL_MS : false),
    refetchOnWindowFocus: (query) => query.state.data === null,
    retry: 1,
    retryDelay: 1000,
  });
}

export const useCurrentUser = useSessionQuery;

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      await http.rawClient.post(API_ROUTES.AUTH.LOGOUT);
      await clearSession({ broadcast: true });
    },
  });
}

/** Xóa toàn bộ trạng thái phía client của phiên (token, cache, store, IndexedDB) */
export async function clearSession(opts: { qc?: QueryClient; broadcast?: boolean } = {}): Promise<void> {
  const qc = opts.qc ?? getQueryClient();

  setAccessToken(null);
  qc.removeQueries({ predicate: (query) => query.queryKey[0] !== "auth" });
  qc.setQueryData(queryKeys.auth.session(), null);

  usePatientStore.getState().clearUserSession();
  void useDoctorStore.getState().clearDoctorSession();
  useUiStore.getState().clearUI();

  if (opts.broadcast !== false) syncBus.broadcast({ type: "AUTH_LOGOUT" });
  await appDb.clearAll();
}
