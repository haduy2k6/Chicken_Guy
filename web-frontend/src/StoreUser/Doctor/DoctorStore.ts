import { create } from "zustand";
import { useAuthStore } from "../Global/AuthStore";
import { UserUI } from "../Global/UserUI";
import { PatientQueueItem, SpecialtyFilter } from "@/src/features/doctor/types";
import { doctorService } from "@/src/features/doctor/services/doctor.service";
import {
  saveDoctorQueueDb,
  loadDoctorQueueDb,
  saveReviewDraftDb,
  loadReviewDraftDb,
  clearDoctorDb,
} from "./DoctorFile";
import { doctorSync } from "./Doctorsync";

export type StatusFilter = "all" | "pending" | "reviewed" | "escalated";

export interface ReviewDraft {
  notes: string;
  status: "pending" | "reviewed" | "escalated";
}

export interface DoctorState {
  queue: PatientQueueItem[];
  selectedCase: PatientQueueItem | null;
  filterSpecialty: SpecialtyFilter;
  filterStatus: StatusFilter;
  searchQuery: string;
  reviewDraft: ReviewDraft;
  isLoading: boolean;
  isSubmittingReview: boolean;
  error: string | null;
  isLoaded: boolean;

  fetchQueue: (forceRefresh?: boolean) => Promise<void>;
  selectCase: (item: PatientQueueItem | null) => Promise<void>;
  updateDraft: (draft: Partial<ReviewDraft>) => void;
  submitReview: (caseId: string) => Promise<boolean>;
  setFilterSpecialty: (filter: SpecialtyFilter) => void;
  setFilterStatus: (filter: StatusFilter) => void;
  setSearchQuery: (query: string) => void;
  clearDoctorSession: () => void;
}

const getDoctorUserId = (): string => {
  return useAuthStore.getState().user?.userId || useAuthStore.getState().name || "doctor";
};

export const useDoctorStore = create<DoctorState>((set, get) => {
  if (typeof window !== "undefined") {
    doctorSync.subscribe((msg) => {
      const activeDoctorId = getDoctorUserId();

      if (msg.type === "DOCTOR_QUEUE_SYNC") {
        set({
          queue: msg.items,
          isLoaded: true,
        });
      } else if (msg.type === "DOCTOR_CASE_REVIEWED") {
        set((s) => ({
          queue: s.queue.map((item) =>
            item.id === msg.caseId
              ? { ...item, status: msg.status }
              : item
          ),
          selectedCase:
            s.selectedCase?.id === msg.caseId
              ? { ...s.selectedCase, status: msg.status }
              : s.selectedCase,
        }));
      } else if (msg.type === "DOCTOR_CLEAR") {
        set({
          queue: [],
          selectedCase: null,
          isLoaded: false,
        });
      }
    });
  }

  return {
    queue: [],
    selectedCase: null,
    filterSpecialty: "all",
    filterStatus: "all",
    searchQuery: "",
    reviewDraft: {
      notes: "",
      status: "reviewed",
    },
    isLoading: false,
    isSubmittingReview: false,
    error: null,
    isLoaded: false,

    fetchQueue: async (forceRefresh = false) => {
      const doctorId = getDoctorUserId();

      if (!forceRefresh && get().isLoaded && get().queue.length > 0) {
        return;
      }

      set({ isLoading: true, error: null });

      // 1. Phục hồi nhanh từ IndexedDB nếu có
      if (!get().isLoaded) {
        const cached = await loadDoctorQueueDb(doctorId);
        if (cached && cached.length > 0) {
          set({ queue: cached, isLoaded: true, isLoading: false });
        }
      }

      // 2. Tải dữ liệu mới nhất từ backend API
      try {
        const items = await doctorService.getPatientQueue();
        const safeItems = Array.isArray(items) ? items : [];

        set({
          queue: safeItems,
          isLoading: false,
          isLoaded: true,
          error: null,
        });

        // Lưu vào IndexedDB và broadcast sang các tab
        saveDoctorQueueDb(doctorId, safeItems);
        doctorSync.broadcast({
          type: "DOCTOR_QUEUE_SYNC",
          doctorId,
          items: safeItems,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: err?.response?.data?.message || err?.message || "Không thể tải danh sách bệnh nhân",
        });
      }
    },

    selectCase: async (item: PatientQueueItem | null) => {
      if (!item) {
        set({ selectedCase: null });
        return;
      }

      const doctorId = getDoctorUserId();
      const savedDraft = await loadReviewDraftDb(doctorId, item.id);

      set({
        selectedCase: item,
        reviewDraft: {
          notes: savedDraft?.notes || "",
          status: (savedDraft?.status as any) || (item.status === "pending" ? "reviewed" : item.status),
        },
      });
    },

    updateDraft: (draft) => {
      const updated: ReviewDraft = { ...get().reviewDraft, ...draft };
      set({ reviewDraft: updated });

      const selected = get().selectedCase;
      if (selected) {
        const doctorId = getDoctorUserId();
        saveReviewDraftDb(doctorId, selected.id, updated);
      }
    },

    submitReview: async (caseId: string): Promise<boolean> => {
      const { reviewDraft } = get();
      const doctorId = getDoctorUserId();

      set({ isSubmittingReview: true, error: null });

      try {
        await doctorService.reviewPatientCase(caseId, {
          notes: reviewDraft.notes,
          status: reviewDraft.status,
        });

        const updatedQueue = get().queue.map((item) =>
          item.id === caseId ? { ...item, status: reviewDraft.status } : item
        );

        set({
          queue: updatedQueue,
          selectedCase: get().selectedCase?.id === caseId
            ? { ...get().selectedCase!, status: reviewDraft.status }
            : get().selectedCase,
          isSubmittingReview: false,
        });

        saveDoctorQueueDb(doctorId, updatedQueue);
        doctorSync.broadcast({
          type: "DOCTOR_CASE_REVIEWED",
          doctorId,
          caseId,
          status: reviewDraft.status,
          notes: reviewDraft.notes,
        });

        return true;
      } catch (err: any) {
        set({
          isSubmittingReview: false,
          error: err?.response?.data?.message || "Lỗi khi gửi kết luận ca bệnh",
        });
        return false;
      }
    },

    setFilterSpecialty: (filter: SpecialtyFilter) => set({ filterSpecialty: filter }),
    setFilterStatus: (filter: StatusFilter) => set({ filterStatus: filter }),
    setSearchQuery: (query: string) => set({ searchQuery: query }),

    clearDoctorSession: () => {
      const doctorId = getDoctorUserId();
      set({
        queue: [],
        selectedCase: null,
        filterSpecialty: "all",
        filterStatus: "all",
        searchQuery: "",
        isLoading: false,
        isSubmittingReview: false,
        isLoaded: false,
        error: null,
      });

      clearDoctorDb();
      doctorSync.broadcast({
        type: "DOCTOR_CLEAR",
        doctorId,
      });
    },
  };
});
