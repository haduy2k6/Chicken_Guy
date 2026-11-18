import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { API_ROUTES } from "@/src/config/routes.config";
import { syncBus } from "@/src/core/broadcastChannel";

export type Role = "patient" | "doctor";

export interface Session {
  accessToken: string;
  userId: string;
  role: Role;
  name?: string;
  email?: string;
  avatar?: string;
}

interface RefreshResponse {
  accessToken: string;
  userId?: string;
  role?: Role | string;
  name?: string;
  email?: string;
  avatar?: string;
}

let inMemoryAccessToken: string | null = null;
let inMemoryRole: Role | null = null;
let lastRefreshedTimestamp = 0;

const REFRESH_REUSE_WINDOW_MS = 5000;

export const getAccessToken = (): string | null => inMemoryAccessToken;

export const setAccessToken = (token: string | null, role?: Role): void => {
  inMemoryAccessToken = token;
  if (token) {
    lastRefreshedTimestamp = Date.now();
    if (role) inMemoryRole = role;
  } else {
    inMemoryRole = null;
    lastRefreshedTimestamp = 0;
  }
};

const toRole = (value: unknown): Role => (value === "doctor" ? "doctor" : "patient");

export function decodeJwtSub(token: string): string | undefined {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)).sub;
  } catch {
    return undefined;
  }
}

const REFRESH_LOCK_NAME = "telehealth_auth_refresh_lock_v1";

type SessionExpiredCallback = () => void | Promise<void>;

export class HttpClient {
  public readonly client: AxiosInstance;
  public readonly rawClient: AxiosInstance;

  private onSessionExpired: SessionExpiredCallback | null = null;
  private activeRefreshPromise: Promise<Session | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_ROUTES.BASE_URL,
      timeout: 30000,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    // rawClient không có interceptor: dùng cho refresh/logout để không lặp vô hạn
    this.rawClient = axios.create({
      baseURL: API_ROUTES.BASE_URL,
      timeout: 15000,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    this.setupInterceptors();
    this.setupCrossTabSync();
  }

  public setSessionExpiredHandler(handler: SessionExpiredCallback | null): void {
    this.onSessionExpired = handler;
  }

  /** Làm mới session từ cookie refresh. Web Locks bảo đảm chỉ một tab gọi cùng lúc, các tab khác dùng lại kết quả trong 5 giây. */
  public async refreshSession(): Promise<Session | null> {
    if (this.activeRefreshPromise) return this.activeRefreshPromise;

    const executeRefresh = async (): Promise<Session | null> => {
      if (inMemoryAccessToken && inMemoryRole && Date.now() - lastRefreshedTimestamp < REFRESH_REUSE_WINDOW_MS) {
        return {
          accessToken: inMemoryAccessToken,
          userId: decodeJwtSub(inMemoryAccessToken) || "user",
          role: inMemoryRole,
        };
      }

      try {
        const { data } = await this.rawClient.post<RefreshResponse>(API_ROUTES.AUTH.REFRESH);
        if (!data?.accessToken) throw new Error("Không nhận được access token từ server");

        const userId = data.userId ?? decodeJwtSub(data.accessToken);
        if (!userId) throw new Error("Không giải mã được thông tin phiên đăng nhập");

        const role = toRole(data.role);
        const session: Session = {
          accessToken: data.accessToken,
          userId,
          role,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
        };

        setAccessToken(data.accessToken, role);
        syncBus.broadcast({ type: "AUTH_TOKEN_REFRESHED", payload: { accessToken: data.accessToken, role } });
        return session;
      } catch (err) {
        const status = (err as AxiosError)?.response?.status;
        if (status === 401 || status === 403) {
          setAccessToken(null);
          return null;
        }
        throw err;
      }
    };

    const promise = (async (): Promise<Session | null> => {
      try {
        if (typeof navigator !== "undefined" && "locks" in navigator) {
          return (await navigator.locks.request(REFRESH_LOCK_NAME, executeRefresh)) as Session | null;
        }
        return await executeRefresh();
      } finally {
        this.activeRefreshPromise = null;
      }
    })();

    this.activeRefreshPromise = promise;
    return promise;
  }

  /** Chia sẻ access token và đăng xuất giữa các tab. Đăng nhập mới do AuthSyncProvider xử lý (nạp lại session). */
  private setupCrossTabSync(): void {
    if (typeof window === "undefined") return;

    syncBus.subscribe((event) => {
      if (event.type === "AUTH_TOKEN_REFRESHED" && event.payload.accessToken) {
        setAccessToken(event.payload.accessToken, toRole(event.payload.role));
      } else if (event.type === "AUTH_LOGOUT") {
        setAccessToken(null);
      }
    });
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;

        const lang = typeof window !== "undefined" && window.location.pathname.startsWith("/en") ? "en" : "vi";
        config.headers.set("Accept-Language", lang);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        const isAuthRoute =
          originalRequest?.url?.includes(API_ROUTES.AUTH.REFRESH) || originalRequest?.url?.includes(API_ROUTES.AUTH.LOGOUT);

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
          originalRequest._retry = true;

          try {
            const session = await this.refreshSession();
            if (session?.accessToken) {
              originalRequest.headers.set("Authorization", `Bearer ${session.accessToken}`);
              return this.client(originalRequest);
            }
          } catch {
            return Promise.reject(error);
          }

          await this.onSessionExpired?.();
        }

        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.get<T>(url, config)).data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.post<T>(url, data, config)).data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.put<T>(url, data, config)).data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.delete<T>(url, config)).data;
  }
}

export const http = new HttpClient();
export const rawAxios = http.rawClient;
