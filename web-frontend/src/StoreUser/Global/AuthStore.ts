import { create } from "zustand";
import { authChannel, AuthEvent, UserSessionPayload } from "./authChannel";

export type UserSession = UserSessionPayload;

export interface LoginPayload {
  role?: "patient" | "doctor" | string;
  accessToken: string;
  isLogin?: boolean;
  name?: string;
  userId?: string;
  email?: string | null;
  avatar?: string | null;
  user?: UserSession | null;
}

export interface AuthStore {
  role: "patient" | "doctor";
  accessToken: string;
  isLogin: boolean;
  isSignIn: boolean; // Alias synced with isLogin for backward compatibility
  name: string;
  user: UserSession | null;
  hasHydrated: boolean;

  hydrate: () => void;
  setToken: (token: string) => void;
  setRole: (newRole: "patient" | "doctor") => void;
  setUser: (user: Partial<UserSession>) => void;
  setLogin: (login: LoginPayload) => void;
  setLogout: () => void;
}

const STORAGE_KEY = "chicken_guy_auth_state_v2";

const normalizeRole = (role?: string | null): "patient" | "doctor" =>
  role === "doctor" ? "doctor" : "patient";

const loadStoredState = (): Partial<AuthStore> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data?.accessToken) {
      const role = normalizeRole(data.role || data.user?.role);
      const name = data.name || data.user?.name || "";
      const user: UserSession = data.user || {
        userId: data.userId || "user",
        role,
        name,
        email: data.email ?? undefined,
        avatar: data.avatar ?? undefined,
      };

      return {
        accessToken: data.accessToken,
        role,
        name,
        user,
        isLogin: true,
        isSignIn: true,
      };
    }
  } catch {}
  return {};
};

const saveStoredState = (state: {
  accessToken: string;
  role: "patient" | "doctor";
  name: string;
  user: UserSession | null;
}) => {
  if (typeof window === "undefined") return;
  try {
    if (state.accessToken) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
};

const LOGGED_OUT_STATE = {
  role: "patient" as const,
  accessToken: "",
  isLogin: false,
  isSignIn: false,
  name: "",
  user: null,
};

export const useAuthStore = create<AuthStore>((set, get) => {
  if (typeof window !== "undefined") {
    authChannel.subscribe((event: AuthEvent) => {
      switch (event.type) {
        case "AUTH_LOGIN": {
          const role = normalizeRole(event.payload.role || event.payload.user?.role);
          const name = event.payload.name || event.payload.user?.name || "";
          const user: UserSession = event.payload.user || {
            userId: "user",
            role,
            name,
          };

          const nextState = {
            accessToken: event.payload.accessToken,
            role,
            name,
            user,
            isLogin: !!event.payload.accessToken,
            isSignIn: !!event.payload.accessToken,
          };
          saveStoredState(nextState);
          set(nextState);
          break;
        }

        case "AUTH_TOKEN_REFRESHED": {
          const token = event.payload.accessToken;
          if (!token) {
            saveStoredState({ accessToken: "", role: "patient", name: "", user: null });
            set(LOGGED_OUT_STATE);
            break;
          }
          const role = event.payload.role ? normalizeRole(event.payload.role) : get().role;
          const name = event.payload.name || get().name;
          const user: UserSession | null = event.payload.user || get().user;

          const nextState = {
            accessToken: token,
            role,
            name,
            user,
            isLogin: true,
            isSignIn: true,
          };
          saveStoredState(nextState);
          set(nextState);
          break;
        }

        case "AUTH_LOGOUT": {
          saveStoredState({ accessToken: "", role: "patient", name: "", user: null });
          set(LOGGED_OUT_STATE);
          break;
        }
      }
    });
  }

  return {
    // Lần render đầu của client phải GIỐNG server → khởi tạo rỗng.
    // Dữ liệu từ localStorage được nạp qua hydrate() sau khi mount.
    ...LOGGED_OUT_STATE,
    hasHydrated: false,

    hydrate: () => {
      if (get().hasHydrated) return;
      set({ ...loadStoredState(), hasHydrated: true });
    },

    setToken: (token: string) => {
      if (!token) {
        get().setLogout();
        return;
      }
      const current = get();
      const nextState = {
        accessToken: token,
        role: current.role,
        name: current.name,
        user: current.user,
        isLogin: true,
        isSignIn: true,
      };
      saveStoredState(nextState);
      set(nextState);

      authChannel.broadcast({
        type: "AUTH_TOKEN_REFRESHED",
        payload: {
          accessToken: token,
          role: current.role,
          name: current.name,
          user: current.user || undefined,
        },
      });
    },

    setRole: (newRole: "patient" | "doctor") => {
      const current = get();
      const updatedUser: UserSession | null = current.user
        ? { ...current.user, role: newRole }
        : null;

      saveStoredState({
        accessToken: current.accessToken,
        role: newRole,
        name: current.name,
        user: updatedUser,
      });
      set({ role: newRole, user: updatedUser });
    },

    setUser: (userData: Partial<UserSession>) => {
      const current = get();
      const updatedUser: UserSession = {
        userId: userData.userId || current.user?.userId || "user",
        role: userData.role || current.role,
        name: userData.name !== undefined ? userData.name : current.name,
        email: userData.email !== undefined ? userData.email : current.user?.email,
        avatar: userData.avatar !== undefined ? userData.avatar : current.user?.avatar,
      };

      saveStoredState({
        accessToken: current.accessToken,
        role: updatedUser.role,
        name: updatedUser.name,
        user: updatedUser,
      });
      set({
        user: updatedUser,
        name: updatedUser.name,
        role: updatedUser.role,
      });
    },

    setLogin: (login: LoginPayload) => {
      const role = normalizeRole(login.role || login.user?.role);
      const name = login.name || login.user?.name || "";
      const user: UserSession = login.user || {
        userId: login.userId || "user",
        role,
        name,
        email: login.email ?? undefined,
        avatar: login.avatar ?? undefined,
      };

      const nextState = {
        accessToken: login.accessToken,
        role,
        name,
        user,
        isLogin: true,
        isSignIn: true,
        hasHydrated: true,
      };

      saveStoredState(nextState);
      set(nextState);

      authChannel.broadcast({
        type: "AUTH_LOGIN",
        payload: {
          accessToken: login.accessToken,
          role,
          name,
          user,
        },
      });
    },

    setLogout: () => {
      saveStoredState({ accessToken: "", role: "patient", name: "", user: null });
      set(LOGGED_OUT_STATE);
      authChannel.broadcast({ type: "AUTH_LOGOUT" });
    },
  };
});