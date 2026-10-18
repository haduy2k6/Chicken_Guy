// src/Store/patientFilesDb.ts

const DB_NAME = "ChickenGuyPatientFilesDB_v2";
const STORE_NAME = "user_patient_files";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB is not available"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getKey(userId?: string | null): string {
  return userId ? `files_${userId}` : "files_guest";
}

export async function savePatientFiles(userId: string | null | undefined, files: File[]): Promise<void> {
  try {
    const db = await openDb();
    const key = getKey(userId);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(files, key);

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn("Failed to save files to IndexedDB", err);
  }
}

export async function loadPatientFiles(userId: string | null | undefined): Promise<File[]> {
  try {
    const db = await openDb();
    const key = getKey(userId);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        db.close();
        const result = req.result;
        if (Array.isArray(result)) {
          resolve(result as File[]);
        } else {
          resolve([]);
        }
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn("Failed to load files from IndexedDB", err);
    return [];
  }
}

export async function clearPatientFiles(userId: string | null | undefined): Promise<void> {
  try {
    const db = await openDb();
    const key = getKey(userId);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn("Failed to clear user files from IndexedDB", err);
  }
}

export async function clearAllPatientFiles(): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn("Failed to clear all patient files from IndexedDB", err);
  }
}
