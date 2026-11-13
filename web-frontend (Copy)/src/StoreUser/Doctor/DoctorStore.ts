import { create } from "zustand";

export type SpecialtyType = "all" | "cancer" | "kidney" | "cardiology";
export type DoctorTabType = "overview" | "queue" | "history" | "consult";

export interface PatientQueueItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  specialty: SpecialtyType;
  submissionDate: string;
  aiRiskScore?: number;
  status: "pending" | "reviewed" | "escalated";
}

export interface DoctorState {
  filterSpecialty: SpecialtyType;
  selectedPatientId: string | null;
  activeTab: DoctorTabType;
  reviewNotes: string;
  queue: PatientQueueItem[];

  setFilterSpecialty: (specialty: SpecialtyType) => void;
  selectPatient: (id: string | null) => void;
  setActiveTab: (tab: DoctorTabType) => void;
  setReviewNotes: (notes: string) => void;
  updatePatientStatus: (id: string, status: "pending" | "reviewed" | "escalated") => void;
  resetDoctorStore: () => void;
}

export const useDoctorStore = create<DoctorState>((set) => ({
  filterSpecialty: "all",
  selectedPatientId: null,
  activeTab: "overview",
  reviewNotes: "",
  queue: [
    {
      id: "P-101",
      name: "Nguyễn Văn A",
      age: 48,
      gender: "Male",
      specialty: "cancer",
      submissionDate: "2026-11-06",
      aiRiskScore: 78,
      status: "pending",
    },
    {
      id: "P-102",
      name: "Trần Thị B",
      age: 52,
      gender: "Female",
      specialty: "kidney",
      submissionDate: "2026-11-07",
      aiRiskScore: 65,
      status: "pending",
    },
    {
      id: "P-103",
      name: "Lê Hoàng C",
      age: 39,
      gender: "Male",
      specialty: "cardiology",
      submissionDate: "2026-11-07",
      aiRiskScore: 42,
      status: "reviewed",
    },
  ],

  setFilterSpecialty: (filterSpecialty) => set({ filterSpecialty }),
  selectPatient: (selectedPatientId) => set({ selectedPatientId }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setReviewNotes: (reviewNotes) => set({ reviewNotes }),
  updatePatientStatus: (id, status) =>
    set((s) => ({
      queue: s.queue.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
  resetDoctorStore: () =>
    set({
      filterSpecialty: "all",
      selectedPatientId: null,
      activeTab: "overview",
      reviewNotes: "",
    }),
}));
