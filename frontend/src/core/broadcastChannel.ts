export type SyncEvent =
  | { type: "AUTH_LOGIN" }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_TOKEN_REFRESHED"; payload: { accessToken: string; role: string } }
  | { type: "PATIENT_SUBMITTED"; payload: { message: string } }
  | { type: "PATIENT_FILES_UPDATED"; payload: { userId: string; count: number } };

export type SyncListener = (event: SyncEvent) => void;

const CHANNEL_NAME = "telehealth_multitab_sync_v1";
const STORAGE_FALLBACK_KEY = "telehealth_sync_fallback_v1";

/** Đồng bộ giữa các tab CỦA CÙNG MỘT TRÌNH DUYỆT (không phải giữa bệnh nhân và bác sĩ). */
class AppSyncBus {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<SyncListener>();

  constructor() {
    if (typeof window === "undefined") return;

    if ("BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (e: MessageEvent<SyncEvent>) => {
          if (e.data?.type) this.notify(e.data);
        };
      } catch {
        this.channel = null;
      }
    }

    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key !== STORAGE_FALLBACK_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.type) this.notify(parsed as SyncEvent);
      } catch {}
    });
  }

  public broadcast(event: SyncEvent): void {
    if (typeof window === "undefined") return;
    if (this.channel) {
      try {
        this.channel.postMessage(event);
        return;
      } catch {}
    }
    try {
      // Fallback localStorage: không bao giờ ghi access token xuống đĩa
      const safe = event.type === "AUTH_TOKEN_REFRESHED" ? { ...event, payload: { ...event.payload, accessToken: "" } } : event;
      localStorage.setItem(STORAGE_FALLBACK_KEY, JSON.stringify({ ...safe, _t: Date.now() }));
      localStorage.removeItem(STORAGE_FALLBACK_KEY);
    } catch {}
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("[syncBus] Listener error:", err);
      }
    });
  }
}

export const syncBus = new AppSyncBus();
