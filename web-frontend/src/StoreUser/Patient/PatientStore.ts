import { create } from "zustand";
import { useAuthStore } from "../Global/AuthStore";
import { UserUI } from "../Global/UserUI";
import {
  savePatientFiles,
  loadPatientFiles,
  clearPatientFiles,
  clearAllPatientFiles,
} from "./patientFilesDb";
import { patientSync } from "./patientSync";

export enum Status {
  empty,
  fill,
  post,
}

export interface PatientState {
  files: File[];
  currentUserId: string | null;
  status: Status;
  isLoaded: boolean;
  submissionSuccessMsg: string | null;

  addFiles: (newFiles: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  loadFilesFromDb: (userId?: string) => Promise<void>;
  clearUserSession: () => void;
  goToForm: () => void;
  backToUpload: () => void;
  setSubmissionSuccess: (msg: string | null, broadcast?: boolean) => void;
}

const resolve = (files: File[], current: Status): Status =>
  files.length === 0 ? Status.empty : current === Status.empty ? Status.fill : current;

const getCurrentUserId = (): string => {
  return useAuthStore.getState().name || "guest";
};

export const usePatientStore = create<PatientState>((set, get) => {
  if (typeof window !== "undefined") {
    patientSync.subscribe((msg) => {
      const activeUserId = getCurrentUserId();
      if (msg.userId !== activeUserId) {
        return;
      }

      if (msg.type === "PATIENT_FILES_SYNC") {
        set((s) => ({
          files: msg.files,
          currentUserId: msg.userId,
          status: resolve(msg.files, s.status),
          submissionSuccessMsg: null,
          isLoaded: true,
        }));
      } else if (msg.type === "PATIENT_FILES_CLEAR") {
        set({
          files: [],
          status: Status.empty,
          isLoaded: true,
        });
      } else if (msg.type === "PATIENT_SUBMIT_SUCCESS") {
        set({
          files: [],
          status: Status.empty,
          submissionSuccessMsg: msg.message,
          isLoaded: true,
        });
        clearPatientFiles(msg.userId);
      }
    });
  }

  return {
    files: [],
    currentUserId: null,
    status: Status.empty,
    isLoaded: false,
    submissionSuccessMsg: null,

    loadFilesFromDb: async (targetUserId?: string) => {
      const userId = targetUserId || getCurrentUserId();

      if (get().isLoaded && get().currentUserId === userId) {
        return;
      }

      if (get().submissionSuccessMsg) {
        return;
      }

      const storedFiles = await loadPatientFiles(userId);
      if (storedFiles.length > 0) {
        set((s) => ({
          files: storedFiles,
          currentUserId: userId,
          status: resolve(storedFiles, s.status),
          isLoaded: true,
        }));
      } else {
        set({
          files: [],
          currentUserId: userId,
          status: Status.empty,
          isLoaded: true,
        });
      }
    },

    addFiles: (newFiles) => {
      const incoming = Array.from(newFiles);
      const current = get().files;
      const updatedFiles = [...current, ...incoming];
      const userId = getCurrentUserId();

      set((s) => ({
        files: updatedFiles,
        currentUserId: userId,
        status: resolve(updatedFiles, s.status),
        submissionSuccessMsg: null,
        isLoaded: true,
      }));

      patientSync.broadcast({
        type: "PATIENT_FILES_SYNC",
        userId,
        files: updatedFiles,
      });

      savePatientFiles(userId, updatedFiles);
    },

    removeFile: (index) => {
      const current = get().files;
      const updatedFiles = current.filter((_, i) => i !== index);
      const userId = getCurrentUserId();

      set((s) => ({
        files: updatedFiles,
        currentUserId: userId,
        status: resolve(updatedFiles, s.status),
        isLoaded: true,
      }));

      patientSync.broadcast({
        type: "PATIENT_FILES_SYNC",
        userId,
        files: updatedFiles,
      });

      savePatientFiles(userId, updatedFiles);
    },

    clearFiles: () => {
      const userId = getCurrentUserId();

      set({
        files: [],
        status: Status.empty,
        isLoaded: true,
      });

      patientSync.broadcast({
        type: "PATIENT_FILES_CLEAR",
        userId,
      });

      clearPatientFiles(userId);
    },

    clearUserSession: () => {
      set({
        files: [],
        currentUserId: null,
        status: Status.empty,
        isLoaded: false,
        submissionSuccessMsg: null,
      });
      clearAllPatientFiles();
    },

    setSubmissionSuccess: (msg: string | null, broadcast = true) => {
      const userId = getCurrentUserId();

      set({
        files: [],
        status: Status.empty,
        submissionSuccessMsg: msg,
        isLoaded: true,
      });

      clearPatientFiles(userId);

      if (broadcast && msg) {
        patientSync.broadcast({
          type: "PATIENT_SUBMIT_SUCCESS",
          userId,
          message: msg,
        });
      }
    },

    goToForm: () =>
      set((s) => {
        const isSignIn = useAuthStore.getState().isLogin;
        if (!isSignIn) {
          UserUI.getState().toggleSignInPopUp();
          return s;
        }
        return s.files.length ? { status: Status.post } : s;
      }),

    backToUpload: () => set((s) => ({ status: resolve(s.files, Status.fill) })),
  };
});
