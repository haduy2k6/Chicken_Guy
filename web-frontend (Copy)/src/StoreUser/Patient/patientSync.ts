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
      } catch {
        this.channel = null;
      }
    }
  }

  public broadcast(msg: PatientSyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {}
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
      } catch {}
    });
  }
}

export const patientSync = new PatientSyncChannel();
