export class IndexedDbStorage {
  private readonly dbName: string = "ChickenGuyPatientFilesDB_v2";
  private readonly storeName: string = "user_patient_files";
  private readonly dbVersion: number = 1;

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !("indexedDB" in window)) {
        return reject(new Error("IndexedDB không khả dụng"));
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private getKey(userId?: string | null): string {
    return userId ? `files_${userId}` : "files_guest";
  }

  public async saveFiles(userId: string | null | undefined, files: File[]): Promise<void> {
    try {
      const db = await this.open();
      const key = this.getKey(userId);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
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
    } catch {}
  }

  public async loadFiles(userId: string | null | undefined): Promise<File[]> {
    try {
      const db = await this.open();
      const key = this.getKey(userId);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);

        req.onsuccess = () => {
          db.close();
          const result = req.result;
          resolve(Array.isArray(result) ? (result as File[]) : []);
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      });
    } catch {
      return [];
    }
  }

  public async clearUserFiles(userId: string | null | undefined): Promise<void> {
    try {
      const db = await this.open();
      const key = this.getKey(userId);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
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
    } catch {}
  }

  public async clearAll(): Promise<void> {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
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
    } catch {}
  }
}

export const patientDbStorage = new IndexedDbStorage();
