import { create } from "zustand";

export interface PatientThemeState {
  dragging: boolean;
  error: string | null;
  setDragging: (dragging: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePatientTheme = create<PatientThemeState>((set) => ({
  dragging: false,
  error: null,
  setDragging: (dragging: boolean) => set({ dragging }),
  setError: (error: string | null) => set({ error }),
}));

export const patientTheme = usePatientTheme;
