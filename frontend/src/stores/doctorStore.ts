import { create } from "zustand";
import { appDb } from "@/src/core/indexedDb";
import type { ReviewDraft, SpecialtyFilter, StatusFilter } from "@/src/features/doctor/types";
import { useAuthStore } from "./authStore";

export type { ReviewDraft, StatusFilter };

export interface DoctorUIState {
  filterSpecialty: SpecialtyFilter;
  filterStatus: StatusFilter;
  selectedCaseId: string | null;
  reviewDraft: ReviewDraft;

  setFilterSpecialty: (filter: SpecialtyFilter) => void;
  setFilterStatus: (filter: StatusFilter) => void;
  selectCaseId: (caseId: string | null) => Promise<void>;
  updateDraft: (draft: Partial<ReviewDraft>) => void;
  clearDraft: (caseId?: string) => Promise<void>;
  clearDoctorSession: (doctorId?: string) => Promise<void>;
}

const SAVE_DEBOUNCE_MS = 500;

interface PendingSave {
  doctorId: string;
  caseId: string;
  draft: ReviewDraft;
}

let pendingSave: PendingSave | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let dbQueue: Promise<void> = Promise.resolve();

function enqueueDb(label: string, task: () => Promise<unknown>): Promise<void> {
  dbQueue = dbQueue.then(async () => {
    try {
      await task();
    } catch (err) {
      console.error(`[doctorStore] ${label} thất bại`, err);
    }
  });
  return dbQueue;
}

function cancelPendingSave(caseId?: string): void {
  if (!pendingSave) return;
  if (caseId && pendingSave.caseId !== caseId) return;
  pendingSave = null;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
}

function flushPendingSave(): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const job = pendingSave;
  pendingSave = null;
  if (!job) return dbQueue;
  return enqueueDb("Lưu nháp", () => appDb.saveDoctorDraft(job.doctorId, job.caseId, job.draft));
}

function scheduleSave(job: PendingSave): void {
  pendingSave = job;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void flushPendingSave();
  }, SAVE_DEBOUNCE_MS);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flushPendingSave();
  });

  window.addEventListener("pagehide", () => void flushPendingSave());
}

const createEmptyDraft = (): ReviewDraft => ({
  notes: "",
  status: "reviewed",
  followUpDate: "",
});

const normalizeDraft = (saved: ReviewDraft): ReviewDraft => {
  const status = saved.status === "escalated" ? "escalated" : "reviewed";
  return {
    notes: typeof saved.notes === "string" ? saved.notes : "",
    status,
    followUpDate:
      status === "reviewed" && typeof saved.followUpDate === "string" ? saved.followUpDate : "",
    assessmentData: saved.assessmentData,
    assessmentFormVersion: saved.assessmentFormVersion,
    referral: status === "escalated" ? saved.referral : undefined,
  };
};

const getDoctorId = (): string | null => useAuthStore.getState().user?.userId ?? null;

export const useDoctorStore = create<DoctorUIState>((set, get) => ({
  filterSpecialty: "all",
  filterStatus: "all",
  selectedCaseId: null,
  reviewDraft: createEmptyDraft(),

  setFilterSpecialty: (filter) => set({ filterSpecialty: filter }),
  setFilterStatus: (filter) => set({ filterStatus: filter }),

  selectCaseId: async (caseId) => {
    if (caseId === get().selectedCaseId) return;

    const flushed = flushPendingSave();

    if (!caseId) {
      set({ selectedCaseId: null, reviewDraft: createEmptyDraft() });
      return;
    }

    const empty = createEmptyDraft();
    set({ selectedCaseId: caseId, reviewDraft: empty });

    const doctorId = getDoctorId();
    if (!doctorId) return;

    await flushed;
    let saved: ReviewDraft | null = null;
    try {
      saved = await appDb.loadDoctorDraft(doctorId, caseId);
    } catch (err) {
      console.error("[doctorStore] Nạp nháp thất bại", err);
    }
    if (get().selectedCaseId !== caseId || get().reviewDraft !== empty) return;
    if (saved) set({ reviewDraft: normalizeDraft(saved) });
  },

  updateDraft: (draft) => {
    const { selectedCaseId, reviewDraft } = get();
    if (!selectedCaseId) return;

    const updated: ReviewDraft = {
      ...reviewDraft,
      ...draft,
      ...(draft.status === "escalated" ? { followUpDate: "" } : {}),
      ...(draft.status === "reviewed" ? { referral: undefined } : {}),
    };
    set({ reviewDraft: updated });

    const doctorId = getDoctorId();
    if (doctorId) scheduleSave({ doctorId, caseId: selectedCaseId, draft: updated });
  },

  clearDraft: async (caseId) => {
    const id = caseId ?? get().selectedCaseId;

    if (id) {
      cancelPendingSave(id);
      const doctorId = getDoctorId();
      if (doctorId) await enqueueDb("Xóa nháp", () => appDb.clearDoctorDraft(doctorId, id));
    }

    if (!id || id === get().selectedCaseId) set({ reviewDraft: createEmptyDraft() });
  },

  clearDoctorSession: async (doctorId) => {
    const id = doctorId ?? getDoctorId();
    cancelPendingSave();
    set({
      filterSpecialty: "all",
      filterStatus: "all",
      selectedCaseId: null,
      reviewDraft: createEmptyDraft(),
    });
    await enqueueDb("Xóa nháp phiên", () =>
      id ? appDb.clearDoctorDraftsOf(id) : appDb.clearAllDoctorDrafts()
    );
  },
}));
