export interface SyncMessage<T = any> {
  type: string;
  payload?: T;
  _timestamp?: number;
}

export type SyncListener<T = any> = (message: SyncMessage<T>) => void;

export class CrossTabSync<T = any> {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener<T>> = new Set();
  private storageKey: string;

  constructor(channelName: string) {
    this.storageKey = `sync_fallback_${channelName}`;

    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        try {
          this.channel = new BroadcastChannel(channelName);
          this.channel.onmessage = (event: MessageEvent<SyncMessage<T>>) => {
            if (event.data?.type) {
              this.notify(event.data);
            }
          };
        } catch {
          this.channel = null;
        }
      }

      window.addEventListener("storage", (event: StorageEvent) => {
        if (event.key === this.storageKey && event.newValue) {
          try {
            const data = JSON.parse(event.newValue) as SyncMessage<T>;
            if (data?.type) {
              this.notify(data);
            }
          } catch {}
        }
      });
    }
  }

  public broadcast(message: SyncMessage<T>): void {
    if (typeof window === "undefined") return;

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {}
    }

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({ ...message, _timestamp: Date.now() })
      );
    } catch {}
  }

  public subscribe(listener: SyncListener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(message: SyncMessage<T>): void {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch {}
    });
  }
}
