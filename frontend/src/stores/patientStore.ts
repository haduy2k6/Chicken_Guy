// src/stores/patientStore.ts
import { create } from "zustand";
import { appDb, mergeFiles } from "@/src/core/indexedDb";
import { syncBus } from "@/src/core/broadcastChannel";
import { useAuthStore } from "./authStore";
import { useUiStore } from "./uiStore";

export enum Status {
  empty = 0,
  fill = 1,
  post = 2,
}

export interface PatientUIState {
  files: File[];
  currentUserId: string | null;
  status: Status;
  isLoaded: boolean;
  isDragging: boolean;
  submissionSuccessMsg: string | null;
  error: string | null;

  addFiles: (newFiles: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  setDragging: (dragging: boolean) => void;
  setError: (error: string | null) => void;
  loadFilesFromDb: (userId?: string) => Promise<void>;
  clearUserSession: () => void;
  goToForm: () => void;
  backToUpload: () => void;
  setSubmissionSuccess: (msg: string | null) => void;
}

const SAVE_FAIL_MSG =
  "Không thể lưu ảnh tạm trên thiết bị (có thể đã hết dung lượng). Bạn vẫn gửi được trong phiên này, nhưng ảnh sẽ mất nếu tải lại trang.";

const resolveStatus = (files: File[], current: Status): Status => {
  if (files.length === 0) return Status.empty;
  if (current === Status.empty) return Status.fill;
  return current;
};

const getActiveUserId = (): string => useAuthStore.getState().user?.userId || "guest";

/** Mỗi lần nạp/đổi file tăng số thứ tự để bỏ qua kết quả bất đồng bộ đã cũ */
let loadSeq = 0;

function persist(userId: string, files: File[]): void {
  void appDb.savePatientFiles(userId, files).then((ok) => {
    if (!ok && usePatientStore.getState().currentUserId === userId) {
      usePatientStore.setState({ error: SAVE_FAIL_MSG });
    }
  });
}

export const usePatientStore = create<PatientUIState>((set, get) => {
  // Đồng bộ giữa các tab của cùng trình duyệt
  if (typeof window !== "undefined") {
    syncBus.subscribe((event) => {
      if (event.type === "PATIENT_SUBMITTED") {
        loadSeq++;
        set({ files: [], status: Status.empty, submissionSuccessMsg: event.payload.message, isLoaded: true });
        return;
      }

      if (event.type === "PATIENT_FILES_UPDATED") {
        const { userId } = event.payload;
        const s = get();
        if (userId !== getActiveUserId() || !s.isLoaded || s.submissionSuccessMsg) return;

        const seq = ++loadSeq;
        void appDb.loadPatientFiles(userId).then((stored) => {
          if (seq !== loadSeq) return;
          set((cur) => ({ files: stored, currentUserId: userId, status: resolveStatus(stored, cur.status) }));
        });
      }
    });
  }

  const touch = (updated: File[], extra: Partial<PatientUIState> = {}) => {
    const userId = getActiveUserId();
    set((s) => ({ files: updated, currentUserId: userId, status: resolveStatus(updated, s.status), isLoaded: true, ...extra }));
    persist(userId, updated);
    syncBus.broadcast({ type: "PATIENT_FILES_UPDATED", payload: { userId, count: updated.length } });
  };

  return {
    files: [],
    currentUserId: null,
    status: Status.empty,
    isLoaded: false,
    isDragging: false,
    submissionSuccessMsg: null,
    error: null,

    setDragging: (dragging) => set({ isDragging: dragging }),
    setError: (error) => set({ error }),

    loadFilesFromDb: async (targetUserId?: string) => {
      const userId = targetUserId || getActiveUserId();
      const s = get();

      if (s.isLoaded && s.currentUserId === userId) return;
      if (s.submissionSuccessMsg) return;

      const seq = ++loadSeq;
      const stored = await appDb.claimGuestFiles(userId); // gộp ảnh khách đã chọn trước khi đăng nhập
      if (seq !== loadSeq) return;

      const cur = get();
      const files = cur.currentUserId === userId && cur.files.length ? mergeFiles(stored, cur.files) : stored;

      set({
        files,
        currentUserId: userId,
        status: files.length ? resolveStatus(files, cur.status) : Status.empty,
        isLoaded: true,
      });
    },

    addFiles: (newFiles) => touch([...get().files, ...Array.from(newFiles)], { submissionSuccessMsg: null, error: null }),

    removeFile: (index) => touch(get().files.filter((_, i) => i !== index)),

    clearFiles: () => {
      const userId = getActiveUserId();
      set({ files: [], status: Status.empty, isLoaded: true });
      void appDb.clearPatientFiles(userId);
      syncBus.broadcast({ type: "PATIENT_FILES_UPDATED", payload: { userId, count: 0 } });
    },

    clearUserSession: () => {
      loadSeq++;
      set({ files: [], currentUserId: null, status: Status.empty, isLoaded: false, submissionSuccessMsg: null, error: null });
      void appDb.clearAllPatientFiles();
    },

    setSubmissionSuccess: (msg) => {
      const userId = getActiveUserId();
      loadSeq++;
      set({ files: [], status: Status.empty, submissionSuccessMsg: msg, error: null, isLoaded: true });
      void appDb.clearPatientFiles(userId);
    },

    // Khách được chọn ảnh trước; sang bước điền form thì bắt buộc đăng nhập
    goToForm: () => {
      if (!useAuthStore.getState().user) {
        useUiStore.getState().setSignInPopUp(true);
        return;
      }
      set((s) => (s.files.length ? { status: Status.post } : s));
    },

    backToUpload: () => set((s) => ({ status: resolveStatus(s.files, Status.fill) })),
  };
});
