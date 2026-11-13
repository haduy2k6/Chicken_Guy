import { API_ROUTES } from "@/src/config/routes.config";
import { http, rawAxios } from "@/src/core/http/httpClient";
import { patientDbStorage } from "@/src/core/storage/indexedDbStorage";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import { UserUI } from "@/src/StoreUser/Global/UserUI";
import { usePatientStore } from "@/src/StoreUser/Patient/PatientStore";
import { getQueryClient } from "@/src/Tanstackquery/tanstackConfig";
import { TokenResponse, UserProfileResponse } from "../types";

export class AuthService {
  public loginWithGoogle(customLocale?: string): void {
    if (typeof window !== "undefined") {
      const locale = customLocale || UserUI.getState().language || "vi";
      window.location.href = API_ROUTES.AUTH.GOOGLE_LOGIN(locale);
    }
  }

  public async getMe(): Promise<UserProfileResponse> {
    return await http.get<UserProfileResponse>(API_ROUTES.AUTH.ME);
  }

  public async refreshToken(): Promise<TokenResponse> {
    const res = await rawAxios.post<TokenResponse>(API_ROUTES.AUTH.REFRESH);
    return res.data;
  }

  public async logout(): Promise<void> {
    try {
      await Promise.allSettled([
        rawAxios.post(API_ROUTES.AUTH.LOGOUT),
        patientDbStorage.clearAll(),
      ]);
    } catch {
    } finally {
      usePatientStore.getState().clearUserSession();
      useAuthStore.getState().setLogout();

      if (typeof window !== "undefined") {
        const queryClient = getQueryClient();
        queryClient.clear();
        queryClient.removeQueries();
      }
    }
  }

  
}

export const authService = new AuthService();
