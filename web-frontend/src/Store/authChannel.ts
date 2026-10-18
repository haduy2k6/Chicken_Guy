
export type AuthEvent =
  | { type: "AUTH_LOGIN"; payload: { accessToken: string; role?: string; userId?: string } }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_TOKEN_REFRESHED"; payload: { accessToken: string; role?: string } };

type Listener = (event: AuthEvent) => void;

const CHANNEL_NAME = "chicken_guy_auth_sync";
const STORAGE_KEY = "chicken_guy_auth_event";

class AuthSyncChannel {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (e: MessageEvent<AuthEvent>) => {
            if (e.data && e.data.type) {
              this.notify(e.data);
            }
          };
        } catch (err) {
          console.warn("BroadcastChannel initialization failed, falling back to storage events", err);
          this.channel = null;
        }
      }
      window.addEventListener("storage", (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const data = JSON.parse(e.newValue) as AuthEvent;
            if (data && data.type) {
              this.notify(data);
            }
          } catch {

          }
        }
      });
    }
  }


  public broadcast(event: AuthEvent): void {
    if (typeof window === "undefined") return;

    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.error("Failed to post message on BroadcastChannel", err);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...event, _t: Date.now() }));
    } catch {

    }
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
      } catch (err) {
        console.error("Error in auth sync listener", err);
      }
    });
  }
}

export const authChannel = new AuthSyncChannel();
