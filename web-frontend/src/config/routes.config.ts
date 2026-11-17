import { ENV } from "./env.config";

export class RouteManager {
  public static readonly PAGES = {
    HOME: "/",
    PATIENT: {
      ROOT: "/patient",
      UPLOAD: "/patient",
      HISTORY: "/appointments",
    },
    DOCTOR: {
      ROOT: "/doctor",
      WORKSPACE: "/doctor",
      DOCTORS: "/doctors",
    },
    SPECIALTIES: {
      ROOT: "/specialties/oncology",
      ONCOLOGY: "/specialties/oncology",
      NEPHROLOGY: "/specialties/nephrology",
      CARDIOLOGY: "/specialties/cardiology",
    },
    DOCTORS: "/doctors",
    APPOINTMENTS: "/appointments",
    ABOUT: "/about",
  } as const;

  public static readonly API = {
    BASE_URL: ENV.apiUrl,
    AUTH: {
      GOOGLE_LOGIN: (locale = "vi", returnUrl?: string) =>
        `${ENV.apiUrl}/auth/google?locale=${encodeURIComponent(locale)}${
          returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : ""
        }`,
      REFRESH: "/auth/refresh",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
    },
    PATIENT: {
      SUBMIT: "/patient",
      HISTORY: "/patient/history",
    },
    DOCTOR: {
      QUEUE: "/doctor/queue",
      REVIEW_CASE: (patientId: string) => `/doctor/review/${patientId}`,
    },
  } as const;

  public static getLocalizedPath(path: string, locale = "vi"): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
  }

  public static isProtectedRoute(pathname: string): boolean {
    return pathname.includes("/patient") || pathname.includes("/doctor") || pathname.includes("/appointments");
  }
}

export const APP_ROUTES = RouteManager.PAGES;
export const API_ROUTES = RouteManager.API;
