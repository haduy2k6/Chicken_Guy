// src/Services/auth.service.ts
import { API_BASE_URL, axiosClient, rawAxios } from "../Axios/axios.config";
import { userAuth } from "../Store/useAuthStore";
import { userTheme } from "../Store/userThemeStore";
import { usePatientStore } from "../Store/usePatientStore";
import { clearAllPatientFiles } from "../Store/patientFilesDb";
import { getQueryClient } from "../Tanstackquery/tanstackConfig";

export interface UserProfile {
  userId: string;
  role: string;
}

export const authService = {
  /**
   * Redirect user to Google OAuth endpoint on backend with current locale
   */
  loginWithGoogle(customLocale?: string): void {
    if (typeof window !== "undefined") {
      const locale = customLocale || userTheme.getState().language || "vi";
      window.location.href = `${API_BASE_URL}/auth/google?locale=${encodeURIComponent(locale)}`;
    }
  },

  /**
   * Fetch current user profile using current access token
   */
  async getMe(): Promise<UserProfile> {
    const res = await axiosClient.get<UserProfile>("/auth/me");
    return res.data;
  },

  /**
   * Perform silent refresh using httpOnly refreshToken cookie
   */
  async refreshToken(): Promise<{ accessToken: string; role?: string }> {
    const res = await rawAxios.post<{ accessToken: string; role?: string }>("/auth/refresh");
    return res.data;
  },

  /**
   * Log out from backend, clear tokens, wipe user data and cache, and broadcast across tabs
   */
  async logout(): Promise<void> {
    try {
      await Promise.allSettled([
        rawAxios.post("/auth/logout"),
        clearAllPatientFiles(),
      ]);
    } catch (err) {
      console.warn("Backend logout request failed, proceeding with local logout", err);
    } finally {
      // 1. Reset patient store and wipe in-memory/IndexedDB files
      usePatientStore.getState().clearUserSession();

      // 2. Clear auth store and broadcast AUTH_LOGOUT to all other tabs
      userAuth.getState().clearAuth(true);

      // 3. Completely purge React Query cache to prevent cross-account profile leaks
      if (typeof window !== "undefined") {
        const queryClient = getQueryClient();
        queryClient.clear();
        queryClient.removeQueries();
      }
    }
  },
};
