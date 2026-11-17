import { PatientQueueItem } from "@/src/features/doctor/types";

const DB_NAME = "ChickenGuyDoctorDb_v2";
const QUEUE_STORE = "doctor_queue_cache";
const DRAFTS_STORE = "doctor_review_drafts";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB is not available"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE);
      }
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        db.createObjectStore(DRAFTS_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getQueueKey(doctorId?: string | null): string {
  return doctorId ? `queue_${doctorId}` : "queue_default";
}

function getDraftKey(doctorId: string | null | undefined, caseId: string): string {
  const d = doctorId || "default";
  return `draft_${d}_${caseId}`;
}

export async function saveDoctorQueueDb(
  doctorId: string | null | undefined,
  items: PatientQueueItem[]
): Promise<void> {
  try {
    const db = await openDb();
    const key = getQueueKey(doctorId);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, "readwrite");
      const store = tx.objectStore(QUEUE_STORE);
      store.put(items, key);

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {}
}

export async function loadDoctorQueueDb(
  doctorId: string | null | undefined
): Promise<PatientQueueItem[]> {
  try {
    const db = await openDb();
    const key = getQueueKey(doctorId);
    return new Promise((resolve) => {
      const tx = db.transaction(QUEUE_STORE, "readonly");
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.get(key);

      req.onsuccess = () => {
        db.close();
        resolve((req.result as PatientQueueItem[]) || []);
      };
      req.onerror = () => {
        db.close();
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}

export async function saveReviewDraftDb(
  doctorId: string | null | undefined,
  caseId: string,
  draft: { notes: string; status: string }
): Promise<void> {
  try {
    const db = await openDb();
    const key = getDraftKey(doctorId, caseId);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DRAFTS_STORE, "readwrite");
      const store = tx.objectStore(DRAFTS_STORE);
      store.put(draft, key);

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {}
}

export async function loadReviewDraftDb(
  doctorId: string | null | undefined,
  caseId: string
): Promise<{ notes: string; status: string } | null> {
  try {
    const db = await openDb();
    const key = getDraftKey(doctorId, caseId);
    return new Promise((resolve) => {
      const tx = db.transaction(DRAFTS_STORE, "readonly");
      const store = tx.objectStore(DRAFTS_STORE);
      const req = store.get(key);

      req.onsuccess = () => {
        db.close();
        resolve(req.result || null);
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

export async function clearDoctorDb(): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE, DRAFTS_STORE], "readwrite");
      tx.objectStore(QUEUE_STORE).clear();
      tx.objectStore(DRAFTS_STORE).clear();

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {}
}
