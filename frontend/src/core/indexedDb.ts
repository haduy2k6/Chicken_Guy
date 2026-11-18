// src/core/storage/indexedDb.ts
import { openDB, type IDBPDatabase } from "idb";
import type { ReviewDraft } from "@/src/features/doctor/types";

const DB_NAME = "TeleHealthAppData";
const LEGACY_DB_NAMES = ["ChickenGuyAppData_v3"];
const DB_VERSION = 1;
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GUEST_ID = "guest";

export const STORES = {
  PATIENT_DRAFTS: "patient_drafts",
  DOCTOR_DRAFTS: "doctor_drafts",
} as const;

interface StoredDoctorDraft {
  draft: ReviewDraft;
  updatedAt: number;
}

interface StoredPatientDraft {
  files: File[];
  updatedAt: number;
}

const fileSig = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
const isFile = (v: unknown): v is File => typeof File !== "undefined" && v instanceof File;

export function mergeFiles(base: File[], extra: File[]): File[] {
  const seen = new Set(base.map(fileSig));
  return [...base, ...extra.filter((f) => !seen.has(fileSig(f)))];
}

class AppIndexedDb {
  private dbPromise: Promise<IDBPDatabase<unknown> | null> | null = null;

  private patientKey(userId: string | null | undefined): string {
    return userId ? `files_${userId}` : `files_${GUEST_ID}`;
  }

  private doctorPrefix(doctorId: string): string {
    return `draft_${doctorId}_`;
  }

  private doctorKey(doctorId: string, caseId: string): string {
    return `${this.doctorPrefix(doctorId)}${caseId}`;
  }

  private async getDb(): Promise<IDBPDatabase<unknown> | null> {
    if (typeof window === "undefined" || !("indexedDB" in window)) return null;

    if (!this.dbPromise) {
      const promise: Promise<IDBPDatabase<unknown> | null> = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORES.PATIENT_DRAFTS)) {
            db.createObjectStore(STORES.PATIENT_DRAFTS);
          }
          if (!db.objectStoreNames.contains(STORES.DOCTOR_DRAFTS)) {
            db.createObjectStore(STORES.DOCTOR_DRAFTS);
          }
        },
        blocking: () => {
          const current = this.dbPromise;
          this.dbPromise = null;
          current?.then((db) => db?.close()).catch(() => {});
        },
        terminated: () => {
          this.dbPromise = null;
        },
      }).catch((err) => {
        console.warn("[IndexedDB] Failed to open DB:", err);
        this.dbPromise = null;
        return null;
      });
      this.dbPromise = promise;
    }
    return this.dbPromise;
  }

  public cleanupLegacyDb(): void {
    if (typeof window === "undefined" || !("indexedDB" in window)) return;
    for (const name of LEGACY_DB_NAMES) {
      try {
        indexedDB.deleteDatabase(name);
      } catch {
      }
    }
  }

  private parsePatient(raw: unknown): { files: File[]; updatedAt: number | null } {
    if (Array.isArray(raw)) return { files: raw.filter(isFile), updatedAt: null };
    const v = raw as Partial<StoredPatientDraft> | undefined;
    if (v && Array.isArray(v.files) && typeof v.updatedAt === "number") {
      return { files: v.files.filter(isFile), updatedAt: v.updatedAt };
    }
    return { files: [], updatedAt: null };
  }

  private isExpired(updatedAt: number | null): boolean {
    return updatedAt !== null && Date.now() - updatedAt > DRAFT_TTL_MS;
  }

  public async savePatientFiles(userId: string | null | undefined, files: File[]): Promise<boolean> {
    try {
      const db = await this.getDb();
      if (!db) return true;
      const key = this.patientKey(userId);
      if (files.length === 0) {
        await db.delete(STORES.PATIENT_DRAFTS, key);
        return true;
      }
      const value: StoredPatientDraft = { files, updatedAt: Date.now() };
      await db.put(STORES.PATIENT_DRAFTS, value, key);
      return true;
    } catch (err) {
      console.warn("[IndexedDB] savePatientFiles error:", err);
      return false;
    }
  }

  public async loadPatientFiles(userId: string | null | undefined): Promise<File[]> {
    try {
      const db = await this.getDb();
      if (!db) return [];
      const key = this.patientKey(userId);
      const { files, updatedAt } = this.parsePatient(await db.get(STORES.PATIENT_DRAFTS, key));
      if (this.isExpired(updatedAt)) {
        await db.delete(STORES.PATIENT_DRAFTS, key);
        return [];
      }
      return files;
    } catch (err) {
      console.warn("[IndexedDB] loadPatientFiles error:", err);
      return [];
    }
  }

  public async claimGuestFiles(userId: string): Promise<File[]> {
    if (!userId || userId === GUEST_ID) return this.loadPatientFiles(GUEST_ID);
    try {
      const db = await this.getDb();
      if (!db) return [];
      const guestKey = this.patientKey(GUEST_ID);
      const ownKey = this.patientKey(userId);
      const tx = db.transaction(STORES.PATIENT_DRAFTS, "readwrite");
      const [guestRaw, ownRaw] = await Promise.all([tx.store.get(guestKey), tx.store.get(ownKey)]);

      const guest = this.parsePatient(guestRaw);
      const own = this.parsePatient(ownRaw);
      const ownFiles = this.isExpired(own.updatedAt) ? [] : own.files;
      const guestFiles = this.isExpired(guest.updatedAt) ? [] : guest.files;

      if (guestFiles.length === 0) {
        if (guestRaw !== undefined) await tx.store.delete(guestKey);
        await tx.done;
        return ownFiles;
      }

      const merged = mergeFiles(ownFiles, guestFiles);
      const value: StoredPatientDraft = { files: merged, updatedAt: Date.now() };
      await tx.store.put(value, ownKey);
      await tx.store.delete(guestKey);
      await tx.done;
      return merged;
    } catch (err) {
      console.warn("[IndexedDB] claimGuestFiles error:", err);
      return this.loadPatientFiles(userId);
    }
  }

  public async clearPatientFiles(userId: string | null | undefined): Promise<void> {
    try {
      const db = await this.getDb();
      if (!db) return;
      await db.delete(STORES.PATIENT_DRAFTS, this.patientKey(userId));
    } catch (err) {
      console.warn("[IndexedDB] clearPatientFiles error:", err);
    }
  }

  public async clearAllPatientFiles(): Promise<void> {
    try {
      const db = await this.getDb();
      if (!db) return;
      await db.clear(STORES.PATIENT_DRAFTS);
    } catch (err) {
      console.warn("[IndexedDB] clearAllPatientFiles error:", err);
    }
  }

  public async pruneExpiredPatientFiles(): Promise<void> {
    try {
      const db = await this.getDb();
      if (!db) return;
      const tx = db.transaction(STORES.PATIENT_DRAFTS, "readwrite");
      let cursor = await tx.store.openCursor();
      while (cursor) {
        const { files, updatedAt } = this.parsePatient(cursor.value);
        if (files.length === 0 || this.isExpired(updatedAt)) {
          await cursor.delete();
        } else if (updatedAt === null) {
          const upgraded: StoredPatientDraft = { files, updatedAt: Date.now() };
          await cursor.update(upgraded);
        }
        cursor = await cursor.continue();
      }
      await tx.done;
    } catch (err) {
      console.warn("[IndexedDB] pruneExpiredPatientFiles error:", err);
    }
  }
  public async saveDoctorDraft(doctorId: string, caseId: string, draft: ReviewDraft): Promise<void> {
    if (!doctorId) return;
    try {
      const db = await this.getDb();
      if (!db) return;
      const value: StoredDoctorDraft = { draft, updatedAt: Date.now() };
      await db.put(STORES.DOCTOR_DRAFTS, value, this.doctorKey(doctorId, caseId));
    } catch (err) {
      console.warn("[IndexedDB] saveDoctorDraft error:", err);
    }
  }

  public async loadDoctorDraft(doctorId: string, caseId: string): Promise<ReviewDraft | null> {
    if (!doctorId) return null;
    try {
      const db = await this.getDb();
      if (!db) return null;
      const key = this.doctorKey(doctorId, caseId);
      const stored = (await db.get(STORES.DOCTOR_DRAFTS, key)) as StoredDoctorDraft | undefined;
      if (!stored?.draft || typeof stored.updatedAt !== "number") return null;
      if (Date.now() - stored.updatedAt > DRAFT_TTL_MS) {
        await db.delete(STORES.DOCTOR_DRAFTS, key);
        return null;
      }
      return stored.draft;
    } catch (err) {
      console.warn("[IndexedDB] loadDoctorDraft error:", err);
      return null;
    }
  }

  public async clearDoctorDraft(doctorId: string, caseId: string): Promise<void> {
    if (!doctorId) return;
    try {
      const db = await this.getDb();
      if (!db) return;
      await db.delete(STORES.DOCTOR_DRAFTS, this.doctorKey(doctorId, caseId));
    } catch (err) {
      console.warn("[IndexedDB] clearDoctorDraft error:", err);
    }
  }

  public async clearDoctorDraftsOf(doctorId: string): Promise<void> {
    if (!doctorId) return;
    try {
      const db = await this.getDb();
      if (!db) return;
      const prefix = this.doctorPrefix(doctorId);
      const range = IDBKeyRange.bound(prefix, prefix + "\uffff");
      const tx = db.transaction(STORES.DOCTOR_DRAFTS, "readwrite");
      let cursor = await tx.store.openCursor(range);
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
      await tx.done;
    } catch (err) {
      console.warn("[IndexedDB] clearDoctorDraftsOf error:", err);
    }
  }

  public async clearAllDoctorDrafts(): Promise<void> {
    try {
      const db = await this.getDb();
      if (!db) return;
      await db.clear(STORES.DOCTOR_DRAFTS);
    } catch (err) {
      console.warn("[IndexedDB] clearAllDoctorDrafts error:", err);
    }
  }

  public async pruneExpiredDoctorDrafts(): Promise<void> {
    try {
      const db = await this.getDb();
      if (!db) return;
      const tx = db.transaction(STORES.DOCTOR_DRAFTS, "readwrite");
      let cursor = await tx.store.openCursor();
      const now = Date.now();
      while (cursor) {
        const v = cursor.value as Partial<StoredDoctorDraft> | undefined;
        if (typeof v?.updatedAt !== "number" || now - v.updatedAt > DRAFT_TTL_MS) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
      await tx.done;
    } catch (err) {
      console.warn("[IndexedDB] pruneExpiredDoctorDrafts error:", err);
    }
  }

  public async pruneExpired(): Promise<void> {
    await Promise.all([this.pruneExpiredPatientFiles(), this.pruneExpiredDoctorDrafts()]);
  }

  public async clearAll(): Promise<void> {
    await Promise.all([this.clearAllPatientFiles(), this.clearAllDoctorDrafts()]);
  }
}

export const appDb = new AppIndexedDb();
