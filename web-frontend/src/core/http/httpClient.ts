import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_ROUTES } from "@/src/config/routes.config";
import { UserUI } from "@/src/StoreUser/Global/UserUI";
import { getQueryClient } from "@/src/Tanstackquery/tanstackConfig";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";

export class HttpClient {
  public readonly client: AxiosInstance;
  public readonly rawClient: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_ROUTES.BASE_URL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.rawClient = axios.create({
      baseURL: API_ROUTES.BASE_URL,
      timeout: 15000,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        const currentLang = UserUI.getState().language || "vi";
        config.headers.set("Accept-Language", currentLang);

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        const isAuthRoute =
          originalRequest?.url?.includes(API_ROUTES.AUTH.REFRESH) ||
          originalRequest?.url?.includes(API_ROUTES.AUTH.LOGOUT);

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !isAuthRoute
        ) {
          originalRequest._retry = true;
          const failedToken = useAuthStore.getState().accessToken;

          try {
            const newToken = await this.performTokenRefresh(failedToken);
            originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
            return this.client(originalRequest);
          } catch (refreshErr) {
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async performTokenRefresh(originalToken: string): Promise<string> {
    const doRefresh = async (): Promise<string> => {
      const currentToken = useAuthStore.getState().accessToken;
      if (currentToken && currentToken !== originalToken) {
        return currentToken;
      }

      if (this.refreshPromise) {
        return await this.refreshPromise;
      }

      this.refreshPromise = (async () => {
        try {
          const response = await this.rawClient.post<{
            accessToken: string;
            role: "patient" | "doctor";
            name:string;
          }>(API_ROUTES.AUTH.REFRESH);

          const { accessToken, role,name } = response.data;
          if (!accessToken) {
            throw new Error("Không nhận được access token từ endpoint refresh");
          }

          let kq= {
            role:role,
            accessToken: accessToken,
            isLogin:true,
            name:name
          }
          useAuthStore.getState().setLogin(kq);
          return accessToken;
        } catch (err) {
          useAuthStore.getState().setLogout();
          if (typeof window !== "undefined") {
            getQueryClient().clear();
          }
          throw err;
        } finally {
          this.refreshPromise = null;
        }
      })();

      return await this.refreshPromise;
    };

    if (typeof navigator !== "undefined" && "locks" in navigator) {
      return await navigator.locks.request("chicken_guy_auth_refresh_lock", async () => {
        return await doRefresh();
      });
    }

    return await doRefresh();
  }

  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const res = await this.client.get<T>(url, { params });
    return res.data;
  }

  public async post<T>(url: string, data?: any, config?: Record<string, any>): Promise<T> {
    const res = await this.client.post<T>(url, data, config);
    return res.data;
  }
}

export const http = new HttpClient();
export const axiosClient = http.client;
export const rawAxios = http.rawClient;
