// src/Store/usePatientStore.tsx
import { create } from "zustand";
import { userAuth } from "./useAuthStore";
import { userTheme } from "./userThemeStore";
import {
  savePatientFiles,
  loadPatientFiles,
  clearPatientFiles,
  clearAllPatientFiles,
} from "./patientFilesDb";

export enum Status {
  empty, // chưa có file  
  fill,  // đã có file  
  post,  
}

export type PatientSyncMessage =
  | { type: "PATIENT_FILES_SYNC"; userId: string; files: File[] }
  | { type: "PATIENT_FILES_CLEAR"; userId: string }
  | { type: "PATIENT_SUBMIT_SUCCESS"; userId: string; message: string };

type SyncListener = (msg: PatientSyncMessage) => void;

const SYNC_CHANNEL_NAME = "chicken_guy_patient_sync_v2";

class PatientSyncChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.channel.onmessage = (e: MessageEvent<PatientSyncMessage>) => {
          if (e.data && e.data.type) {
            this.notify(e.data);
          }
        };
      } catch (err) {
        console.warn("Patient BroadcastChannel initialization failed", err);
      }
    }
  }

  public broadcast(msg: PatientSyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.error("Failed to broadcast patient sync message", err);
      }
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(msg: PatientSyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error("Error in patient sync listener", err);
      }
    });
  }
}

export const patientSync = new PatientSyncChannel();

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
  return userAuth.getState().user?.userId || "guest";
};

export const usePatientStore = create<PatientState>((set, get) => {
  // Listen to instant structured-clone messages from other tabs
  if (typeof window !== "undefined") {
    patientSync.subscribe((msg) => {
      const activeUserId = getCurrentUserId();
      // Strictly ignore sync messages belonging to a different user session
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

      // If already loaded for the current user and files are acknowledged, avoid redundant I/O
      if (get().isLoaded && get().currentUserId === userId) {
        return;
      }

      // If user had submission success banner up, don't reload stale files
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

      // 1. Instant RAM update for current tab
      set((s) => ({
        files: updatedFiles,
        currentUserId: userId,
        status: resolve(updatedFiles, s.status),
        submissionSuccessMsg: null,
        isLoaded: true,
      }));

      // 2. Instant RAM sync to all other tabs via Structured Clone
      patientSync.broadcast({
        type: "PATIENT_FILES_SYNC",
        userId,
        files: updatedFiles,
      });

      // 3. Persistent backing store in IndexedDB isolated per user
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
        const isSignIn = userAuth.getState().isSignIn;
        if (!isSignIn) {
          userTheme.getState().toggleSignInPopUp();
          return s;
        }
        return s.files.length ? { status: Status.post } : s;
      }),

    backToUpload: () => set((s) => ({ status: resolve(s.files, Status.fill) })),
  };
});