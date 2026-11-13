"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import { UserUI } from "@/src/StoreUser/Global/UserUI";
import { usePatientStore } from "@/src/StoreUser/Patient/PatientStore";
import { authChannel } from "@/src/StoreUser/Global/authChannel";
import { authService } from "../services/auth.service";
import { getQueryClient } from "@/src/Tanstackquery/tanstackConfig";

type Role = "patient" | "doctor";

const normalizeRole = (role?: string | null): Role =>
  role === "doctor" ? "doctor" : "patient";

/**
 * Đăng nhập hoàn chỉnh từ một accessToken.
 * - Đặt token vào store bằng setState (KHÔNG broadcast) để interceptor gắn
 *   Authorization cho request getMe().
 * - Nếu thiếu role/name thì lấy từ getMe().
 * - Cuối cùng gọi setLogin() đúng 1 lần (bật isLogin + broadcast sang tab khác).
 */
async function loginWithToken(
  accessToken: string,
  hint?: { role?: string | null; name?: string | null }
): Promise<void> {
  let role = hint?.role ?? undefined;
  let name = hint?.name ?? undefined;

  if (!role || !name) {
    useAuthStore.setState({ accessToken });
    try {
      const profile = (await authService.getMe()) as unknown as {
        role?: string;
        name?: string;
      };
      role = role ?? profile?.role;
      name = name ?? profile?.name;
    } catch (err) {
      console.warn("[AuthSyncProvider] getMe failed after login:", err);
    }
  }

  useAuthStore.getState().setLogin({
    accessToken,
    role: normalizeRole(role),
    name: name ?? "",
    isLogin: true,
  });
}

/** Xóa state đăng nhập ở tab hiện tại, KHÔNG broadcast và KHÔNG redirect. */
function clearLocalAuth(): void {
  useAuthStore.setState({
    role: "patient",
    accessToken: "",
    isLogin: false,
    name: "",
  });
}

export function AuthSyncProvider({
  children,
  currentLocale,
}: {
  children: React.ReactNode;
  currentLocale?: string;
}) {
  const isSessionChecked = useRef(false);

  // Đồng bộ ngôn ngữ theo locale của route
  useEffect(() => {
    if (currentLocale) {
      UserUI.getState().syncFromLocale(currentLocale);
    }
  }, [currentLocale]);

  // Đồng bộ giữa các tab.
  // Việc set state (accessToken/role/name/isLogin) đã do AuthStore tự subscribe xử lý,
  // nên ở đây chỉ làm các side-effect: query cache và patient store.
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
          queryClient.clear();
          queryClient.removeQueries();
          break;

        case "AUTH_TOKEN_REFRESHED":
          // AuthStore đã cập nhật token, không cần làm gì thêm
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Khôi phục session khi app mount (sau redirect Google hoặc khi F5)
  useEffect(() => {
    if (typeof window === "undefined" || isSessionChecked.current) return;
    isSessionChecked.current = true;

    const handleUrlToken = async (): Promise<boolean> => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      if (!tokenFromUrl) return false;

      // Xóa token khỏi URL, giữ nguyên các query khác
      urlParams.delete("token");
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
        if (await handleUrlToken()) return;

        // Đã có token trong store (ví dụ tab khác vừa sync) thì thôi
        if (useAuthStore.getState().accessToken) return;

        // Không có token: thử dùng refresh-token cookie
        try {
          const data = (await authService.refreshToken()) as unknown as {
            accessToken?: string;
            role?: string;
            name?: string;
          };

          if (data?.accessToken) {
            await loginWithToken(data.accessToken, {
              role: data.role,
              name: data.name,
            });
          }
        } catch {
          // Chưa đăng nhập hoặc cookie hết hạn: bỏ qua.
          // Không gọi setLogout() vì nó redirect /login.
          if (useAuthStore.getState().isLogin) {
            clearLocalAuth();
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
