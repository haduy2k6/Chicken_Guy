import { API_ROUTES } from "@/src/config/routes.config";
import { http } from "@/src/core/httpClient";
import { useUiStore } from "@/src/stores/uiStore";
import { clearSession } from "@/src/query/useSessionQuery";

export class AuthService {
  /** Điều hướng cả trang sang backend; xong backend redirect về `/{locale}/{role}?auth=success` */
  public loginWithGoogle(customLocale?: string): void {
    if (typeof window === "undefined") return;
    const locale = customLocale || useUiStore.getState().language || "vi";
    window.location.href = API_ROUTES.AUTH.GOOGLE_LOGIN(locale, window.location.origin);
  }

  /** Báo server hủy refresh token + cookie, rồi dọn toàn bộ cache, token, nháp IndexedDB ở client */
  public async logout(): Promise<void> {
    try {
      await http.rawClient.post(API_ROUTES.AUTH.LOGOUT);
    } catch {
      // Server lỗi vẫn phải dọn sạch trạng thái client
    } finally {
      await clearSession({ broadcast: true });
    }
  }
}

export const authService = new AuthService();
