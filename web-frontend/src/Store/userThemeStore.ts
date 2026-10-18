// src/Store/userThemeStore.ts
import { create } from "zustand";

export type SupportedLocale = "en" | "vi";

interface ThemeStore {
  language: SupportedLocale;
  signInPopUp: boolean;
  setLanguage: (newLanguage: SupportedLocale) => void;
  syncFromLocale: (locale: string) => void;
  setSignInPopup: (newState: boolean) => void;
  toggleSignInPopUp: () => void;
}

const LOCALE_COOKIE_KEY = "NEXT_LOCALE";

const getInitialLocale = (): SupportedLocale => {
  if (typeof window !== "undefined") {
    const match = window.location.pathname.match(/^\/(vi|en)(\/|$)/);
    if (match && (match[1] === "vi" || match[1] === "en")) {
      return match[1] as SupportedLocale;
    }

    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [name, val] = cookie.split("=");
      if (name === LOCALE_COOKIE_KEY && (val === "vi" || val === "en")) {
        return val as SupportedLocale;
      }
    }
  }
  return "en";
};

const setLocaleCookie = (locale: SupportedLocale) => {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

export const userTheme = create<ThemeStore>((set, get) => ({
  language: getInitialLocale(),
  signInPopUp: false,

  setLanguage: (newLanguage: SupportedLocale) => {
    setLocaleCookie(newLanguage);
    set({ language: newLanguage });
  },

  syncFromLocale: (locale: string) => {
    const validLocale: SupportedLocale = locale === "en" ? "en" : "vi";
    if (get().language !== validLocale) {
      setLocaleCookie(validLocale);
      set({ language: validLocale });
    }
  },

  setSignInPopup: (newState) => set({ signInPopUp: newState }),
  toggleSignInPopUp: () => set((state) => ({ signInPopUp: !state.signInPopUp })),
}));