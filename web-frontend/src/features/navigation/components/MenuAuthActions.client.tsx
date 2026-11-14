"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import { UserUI } from "@/src/StoreUser/Global/UserUI";
import { authService } from "@/src/features/auth/services/auth.service";
import { APP_ROUTES } from "@/src/config/routes.config";
import { useRouter } from "@/src/i18n/routing";
import { Button, Dropdown } from "@heroui/react";
import { LogOut, FileText, Stethoscope, Sparkles } from "lucide-react";

const ITEM_CLASS =
  "rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 data-[focused=true]:bg-cyan-50 cursor-pointer";

export function MenuAuthActions({
  signInLabel,
  signOutLabel,
  historyLabel,
}: {
  signInLabel: string;
  signOutLabel: string;
  historyLabel: string;
}) {
  const router = useRouter();

  // Tất cả hook phải nằm TRƯỚC mọi lệnh return
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const isSignIn = useAuthStore((state) => state.isSignIn || state.isLogin);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role || state.user?.role || "patient");
  const userName = useAuthStore((state) => state.name || state.user?.name);
  const setSignInPopup = UserUI((state) => state.setSignInPopup);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const displayName =
    userName ||
    (user?.email ? user.email.split("@")[0] : role === "doctor" ? "Bác sĩ" : "Bệnh nhân");

  const handleAction = (key: React.Key) => {
    if (key === "sign-out") {
      authService.logout();
      return;
    }
    router.push(String(key));
  };

  // Chưa hydrate: render placeholder giống server để tránh hydration mismatch
  if (!hasHydrated) {
    return <div className="h-9 w-24 rounded-xl bg-stone-100 animate-pulse" />;
  }

  if (!isSignIn) {
    return (
      <Button
        variant="secondary"
        onClick={() => setSignInPopup(true)}
        className="rounded-xl font-bold text-xs sm:text-sm px-4 py-2 bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
      >
        {signInLabel}
      </Button>
    );
  }

  return (
    <Dropdown>
      <Button
        variant="secondary"
        className="rounded-xl font-bold text-xs sm:text-sm px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center gap-2 cursor-pointer shadow-xs border border-stone-200/60"
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-600/30"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px] font-black">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-w-28 truncate">{displayName}</span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-200/80 text-stone-600 uppercase tracking-wider">
          {role === "doctor" ? "BS" : "BN"}
        </span>
      </Button>

      <Dropdown.Popover
        placement="bottom end"
        className="rounded-2xl border border-stone-200/80 bg-white/95 backdrop-blur-md p-1.5 shadow-xl min-w-52 z-50"
      >
        {/* Header nằm NGOÀI Dropdown.Menu (Menu chỉ nhận Item/Section) */}
        <div className="px-3 py-2 border-b border-stone-100 mb-1">
          <p className="text-xs font-bold text-stone-900 truncate">{displayName}</p>
          {user?.email && (
            <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
          )}
          <p className="text-[10px] font-semibold text-cyan-700 mt-0.5">
            {role === "doctor" ? "Tài khoản Bác sĩ" : "Tài khoản Bệnh nhân"}
          </p>
        </div>

        <Dropdown.Menu onAction={handleAction}>
          {role === "doctor" ? (
            <Dropdown.Item
              id={APP_ROUTES.DOCTOR.WORKSPACE}
              textValue="Bàn làm việc Bác sĩ"
              className={ITEM_CLASS}
            >
              <div className="flex items-center gap-2 w-full">
                <Stethoscope className="w-3.5 h-3.5 text-cyan-700" />
                <span>Bàn làm việc Bác sĩ</span>
              </div>
            </Dropdown.Item>
          ) : (
            <Dropdown.Item
              id={APP_ROUTES.PATIENT.ROOT}
              textValue="Sàng lọc AI"
              className={ITEM_CLASS}
            >
              <div className="flex items-center gap-2 w-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Sàng lọc Ung thư Vòm họng</span>
              </div>
            </Dropdown.Item>
          )}

          <Dropdown.Item
            id={APP_ROUTES.APPOINTMENTS}
            textValue={historyLabel}
            className={ITEM_CLASS}
          >
            <div className="flex items-center gap-2 w-full">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>{historyLabel}</span>
            </div>
          </Dropdown.Item>

          <Dropdown.Item
            id="sign-out"
            textValue={signOutLabel}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 data-[focused=true]:bg-rose-50 cursor-pointer mt-1 border-t border-stone-100"
          >
            <div className="flex items-center gap-2 w-full">
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>{signOutLabel}</span>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export default MenuAuthActions;