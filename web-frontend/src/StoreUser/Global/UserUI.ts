import { create } from "zustand";

export type Language = "en" | "vi";

export interface UiForUser {
  language: Language;
  signInPopUp: boolean;

  setLanguage: (lang?: Language) => void;
  syncFromLocale: (locale: string) => void;
  setSignInPopup: (open: boolean) => void;
  toggleSignInPopUp: () => void;
  clearUI: () => void;
}

export const UserUI = create<UiForUser>((set, get) => ({
  language: "vi",
  signInPopUp: false,

  setLanguage: (lang) => {
    if (lang) {
      set({ language: lang });
    } else {
      set({ language: get().language === "en" ? "vi" : "en" });
    }
  },

  syncFromLocale: (locale) => set({ language: locale === "en" ? "en" : "vi" }),

  setSignInPopup: (open) => set({ signInPopUp: open }),

  toggleSignInPopUp: () => set((s) => ({ signInPopUp: !s.signInPopUp })),
  clearUI: () => set({ signInPopUp: false }),
}));

export const userTheme = UserUI;
