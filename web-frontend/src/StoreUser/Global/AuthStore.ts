import { create } from "zustand";
import { authChannel, AuthEvent } from "./authChannel"; 
interface AuthStore {
  role: "patient" | "doctor";
  accessToken: string;
  isLogin: boolean;
  name: string;
  setToken: (token: string) => void;
  setRole: (newRole: "patient" | "doctor") => void;
  setLogin: (login: Login) => void;
  setLogout: () => void;
}

interface Login {
  role: "patient" | "doctor";
  accessToken: string;
  isLogin: boolean;
  name: string;
}

export const useAuthStore = create<AuthStore>((set, get) => {

  if (typeof window !== "undefined") {
    authChannel.subscribe((event: AuthEvent) => {
      switch (event.type) {
        case "AUTH_LOGIN":
          set({
            accessToken: event.payload.accessToken,
            role: (event.payload.role as "patient" | "doctor") || "patient",
            name: event.payload.name || "",
            isLogin: true,
          });
          break;

        case "AUTH_TOKEN_REFRESHED":
          set({
            accessToken: event.payload.accessToken,
            ...(event.payload.role ? { role: event.payload.role as "patient" | "doctor" } : {}),
          });
          break;

        case "AUTH_LOGOUT":
       
          set({
            role: "patient",
            accessToken: "",
            isLogin: false,
            name: "",
          });
          localStorage.removeItem("access_token");
          window.location.href = "/login";
          break;
      }
    });
  }

  return {
    role: "patient",
    accessToken: "",
    isLogin: false,
    name: "",

    setToken: (token: string) => {
      set({ accessToken: token });
      authChannel.broadcast({
        type: "AUTH_TOKEN_REFRESHED",
        payload: { accessToken: token, role: get().role },
      });
    },

    setRole: (newRole: "patient" | "doctor") => set({ role: newRole }),

    setLogin: (login: Login) => {
      set({ ...login });
      authChannel.broadcast({
        type: "AUTH_LOGIN",
        payload: {
          accessToken: login.accessToken,
          role: login.role,
          name: login.name,
        },
      });
    },

    setLogout: () => {
      set({
        role: "patient",
        accessToken: "",
        isLogin: false,
        name: "",
      });

      authChannel.broadcast({
        type: "AUTH_LOGOUT",
      });

      window.location.href = "/login";
    },
  };
});