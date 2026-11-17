export interface UserSessionPayload {
  userId: string;
  role: "patient" | "doctor";
  name: string;
  email?: string;
  avatar?: string;
}

type TokenPayload = {
  accessToken: string;
  role?: "patient" | "doctor" | string;
  name?: string;
  user?: UserSessionPayload;
};

export type AuthEvent =
  | { type: "AUTH_LOGIN"; payload: TokenPayload }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_TOKEN_REFRESHED"; payload: TokenPayload };

type Listener = (event: AuthEvent) => void;

const CHANNEL_NAME = "chicken_guy_auth_sync_v2";
const STORAGE_KEY = "chicken_guy_auth_event_v2";

class AuthSyncChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window === "undefined") return;

    if ("BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (e: MessageEvent<AuthEvent>) => {
          if (e.data && e.data.type) {
            this.notify(e.data);
          }
        };
      } catch {
        this.channel = null;
      }
    }

    // Chỉ dùng "storage" làm fallback khi không có BroadcastChannel,
    // tránh nhận cùng một event 2 lần.
    if (!this.channel) {
      window.addEventListener("storage", (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const data = JSON.parse(e.newValue) as AuthEvent;
            if (data && data.type) {
              this.notify(data);
            }
          } catch {}
        }
      });
    }
  }

  public broadcast(event: AuthEvent): void {
    if (typeof window === "undefined") return;

    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch {}
      return;
    }

    // Fallback: trình duyệt không có BroadcastChannel
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...event, _t: Date.now() }));
      // Xoá ngay để token không nằm lại trên đĩa
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: AuthEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {}
    });
  }
}

export const authChannel = new AuthSyncChannel();