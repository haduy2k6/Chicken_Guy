import { PatientQueueItem } from "@/src/features/doctor/types";

export type DoctorSyncMessage =
  | {
      type: "DOCTOR_QUEUE_SYNC";
      doctorId: string;
      items: PatientQueueItem[];
    }
  | {
      type: "DOCTOR_CASE_REVIEWED";
      doctorId: string;
      caseId: string;
      status: "pending" | "reviewed" | "escalated";
      notes?: string;
    }
  | {
      type: "DOCTOR_CLEAR";
      doctorId: string;
    };

type Listener = (msg: DoctorSyncMessage) => void;

const CHANNEL_NAME = "chicken_guy_doctor_sync_v2";
const STORAGE_KEY = "chicken_guy_doctor_sync_event_v2";

class DoctorSyncChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (e: MessageEvent<DoctorSyncMessage>) => {
            if (e.data && e.data.type) {
              this.notify(e.data);
            }
          };
        } catch {
          this.channel = null;
        }
      }

      window.addEventListener("storage", (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const data = JSON.parse(e.newValue) as DoctorSyncMessage;
            if (data && data.type) {
              this.notify(data);
            }
          } catch {}
        }
      });
    }
  }

  public broadcast(msg: DoctorSyncMessage): void {
    if (typeof window === "undefined") return;

    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {}
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...msg, _t: Date.now() }));
    } catch {}
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(msg: DoctorSyncMessage): void {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch {}
    });
  }
}

export const doctorSync = new DoctorSyncChannel();
