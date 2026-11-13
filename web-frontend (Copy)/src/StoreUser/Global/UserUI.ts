
import { create } from "zustand";

export interface UiForUser {
  login: boolean;
  role: "patient" | "doctor";
  language: "en" | "vi";
  workLink: string;
  name: string;
  signInPopUp: boolean;

  setLanguage: (lang?: "en" | "vi") => void;
  syncFromLocale: (locale: string) => void;
  setSignInPopup: (open: boolean) => void;
  toggleSignInPopUp: () => void;
  clearUI: () => void;
  setLogin: (data: InputLogin) => void;
}

export interface InputLogin {
  role: "patient" | "doctor";
  name: string;
}

export const UserUI = create<UiForUser>((set, get) => ({
  login: false,
  role: "patient",
  language: "vi",
  workLink: "/patient",
  name: "",
  signInPopUp: false,

  setLanguage: (lang) => {
    if (lang) {
      set({ language: lang });
    } else {
      const current = get().language;
      set({ language: current === "en" ? "vi" : "en" });
    }
  },

  syncFromLocale: (locale: string) => {
    const valid = locale === "en" ? "en" : "vi";
    set({ language: valid });
  },

  setSignInPopup: (open: boolean) => set({ signInPopUp: open }),

  toggleSignInPopUp: () => set((s) => ({ signInPopUp: !s.signInPopUp })),

  clearUI: () =>
    set({
      login: false,
      role: "patient",
      name: "",
      signInPopUp: false,
    }),

  setLogin: (data: InputLogin) =>
    set({
      role: data.role,
      login: true,
      name: data.name,
      workLink: data.role === "patient" ? "/patient" : "/doctor",
    }),
}));

export const userTheme = UserUI;