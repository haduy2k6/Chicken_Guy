// src/Axios/axios.config.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { userAuth } from "../Store/useAuthStore";
import { userTheme } from "../Store/userThemeStore";
import { getQueryClient } from "../Tanstackquery/tanstackConfig";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const rawAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = userAuth.getState().accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const currentLang = userTheme.getState().language || "vi";
    config.headers.set("Accept-Language", currentLang);

    return config;
  },
  (error) => Promise.reject(error)
);

async function performTokenRefresh(originalToken: string): Promise<string> {
  const doRefresh = async (): Promise<string> => {
    const currentToken = userAuth.getState().accessToken;
    if (currentToken && currentToken !== originalToken) {
      return currentToken;
    }

    if (refreshPromise) {
      return await refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const response = await rawAxios.post<{ accessToken: string; role?: string }>(
          "/auth/refresh"
        );
        const { accessToken, role } = response.data;

        if (!accessToken) {
          throw new Error("No access token returned from refresh endpoint");
        }

        userAuth.getState().setAuth({ accessToken, role }, true);

        return accessToken;
      } catch (err) {
        userAuth.getState().clearAuth(true);
        if (typeof window !== "undefined") {
          getQueryClient().clear();
        }
        throw err;
      } finally {
        refreshPromise = null;
      }
    })();

    return await refreshPromise;
  };

  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return await navigator.locks.request("chicken_guy_auth_refresh_lock", async () => {
      return await doRefresh();
    });
  }

  return await doRefresh();
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const isAuthRoute =
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/logout");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      const failedToken = userAuth.getState().accessToken;

      try {
        const newToken = await performTokenRefresh(failedToken);
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);