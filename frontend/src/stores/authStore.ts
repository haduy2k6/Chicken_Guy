import { create } from "zustand";
import type { Role, Session } from "@/src/core/httpClient";

export interface UserSession {
  userId: string;
  role: Role;
  name: string;
  email?: string;
  avatar?: string;
}

/** Bản sao của session phục vụ UI. Đã đăng nhập = `user !== null`, vai trò = `user.role` (không lưu thêm cờ trùng lặp). */
export interface AuthState {
  user: UserSession | null;
  authReady: boolean;
}

export const useAuthStore = create<AuthState>(() => ({ user: null, authReady: false }));

export function syncAuthStore(session: Session | null | undefined, ready: boolean): void {
  if (!session) {
    useAuthStore.setState({ user: null, authReady: ready });
    return;
  }

  const name =
    session.name ||
    (session.email ? session.email.split("@")[0] : session.role === "doctor" ? "Bác sĩ" : "Bệnh nhân");

  useAuthStore.setState({
    user: { userId: session.userId, role: session.role, name, email: session.email, avatar: session.avatar },
    authReady: ready,
  });
}
