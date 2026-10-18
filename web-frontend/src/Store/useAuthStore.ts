// src/Store/useAuthStore.ts
import { create } from "zustand";
import { authChannel } from "./authChannel";

export interface UserSession {
  userId: string;
  role: string;
}

export interface AuthUIStore {
  accessToken: string;
  isSignIn: boolean;
  user: UserSession | null;
  isInitialized: boolean;

  setAuth: (data: { accessToken: string; role?: string; userId?: string }, broadcast?: boolean) => void;
  setAccessToken: (token: string, broadcast?: boolean) => void;
  setUser: (user: UserSession | null) => void;
  setInitialized: (initialized: boolean) => void;
  setSignIn: () => void;
  setSignOut: () => void;
  clearAuth: (broadcast?: boolean) => void;
  clearToken: () => void;
}

const AUTH_HINT_KEY = "chicken_guy_is_auth_hint";

const getInitialHint = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(AUTH_HINT_KEY) === "true";
  } catch {
    return false;
  }
};

const setAuthHint = (isAuth: boolean) => {
  if (typeof window === "undefined") return;
  try {
    if (isAuth) {
      localStorage.setItem(AUTH_HINT_KEY, "true");
    } else {
      localStorage.removeItem(AUTH_HINT_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
};

export function parseJwt(token: string): { userId?: string; role?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return {
      userId: decoded.sub || decoded.userId,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export const userAuth = create<AuthUIStore>((set, get) => ({
  accessToken: "",
  isSignIn: getInitialHint(),
  user: null,
  isInitialized: false,

  setAuth: ({ accessToken, role, userId }, broadcast = true) => {
    let finalUserId = userId;
    let finalRole = role;

    if ((!finalUserId || !finalRole) && accessToken) {
      const decoded = parseJwt(accessToken);
      if (decoded?.userId && !finalUserId) finalUserId = decoded.userId;
      if (decoded?.role && !finalRole) finalRole = decoded.role;
    }

    const sessionUser: UserSession | null = finalUserId
      ? { userId: finalUserId, role: finalRole || "patient" }
      : get().user;

    setAuthHint(true);
    set({
      accessToken,
      isSignIn: true,
      user: sessionUser,
      isInitialized: true,
    });

    if (broadcast) {
      authChannel.broadcast({
        type: "AUTH_LOGIN",
        payload: {
          accessToken,
          role: sessionUser?.role,
          userId: sessionUser?.userId,
        },
      });
    }
  },

  setAccessToken: (token: string, broadcast = false) => {
    set({ accessToken: token });
    if (broadcast) {
      authChannel.broadcast({
        type: "AUTH_TOKEN_REFRESHED",
        payload: { accessToken: token, role: get().user?.role },
      });
    }
  },

  setUser: (user) => set({ user }),

  setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),

  setSignIn: () => {
    setAuthHint(true);
    set({ isSignIn: true });
  },

  setSignOut: () => {
    get().clearAuth(true);
  },

  clearAuth: (broadcast = true) => {
    setAuthHint(false);
    set({
      accessToken: "",
      isSignIn: false,
      user: null,
      isInitialized: true,
    });

    if (broadcast) {
      authChannel.broadcast({ type: "AUTH_LOGOUT" });
    }
  },

  clearToken: () => {
    get().clearAuth(false);
  },
}));
