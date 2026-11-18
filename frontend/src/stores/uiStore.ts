import { create } from "zustand";

export type Language = "en" | "vi";

export interface UiState {
  language: Language;
  signInPopUp: boolean;

  setLanguage: (lang?: Language) => void;
  syncFromLocale: (locale: string) => void;
  setSignInPopUp: (open: boolean) => void;
  clearUI: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  language: "vi",
  signInPopUp: false,

  setLanguage: (lang) => set({ language: lang ?? (get().language === "en" ? "vi" : "en") }),
  syncFromLocale: (locale) => set({ language: locale === "en" ? "en" : "vi" }),
  setSignInPopUp: (open) => set({ signInPopUp: open }),
  clearUI: () => set({ signInPopUp: false }),
}));
