"use client";

import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import { UserUI } from "@/src/StoreUser/Global/UserUI";
import { authService } from "@/src/features/auth/services/auth.service";
import { APP_ROUTES } from "@/src/config/routes.config";
import { Link } from "@/src/i18n/routing";
import { Button, Dropdown } from "@heroui/react";
import { User, LogOut, FileText } from "lucide-react";

export function MenuAuthActions({
  signInLabel,
  signOutLabel,
  historyLabel,
}: {
  signInLabel: string;
  signOutLabel: string;
  historyLabel: string;
}) {
  const isSignIn = useAuthStore((state) => state.isSignIn);
  const user = useAuthStore((state) => state.user);
  const setSignInPopup = UserUI((state) => state.setSignInPopup);

  const displayName = user?.name || (user?.role === "doctor" ? "Bác sĩ" : "Bệnh nhân");

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
        className="rounded-xl font-bold text-xs sm:text-sm px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center gap-2 cursor-pointer"
      >
        <User className="w-3.5 h-3.5 text-cyan-700" />
        <span className="max-w-30 truncate">{displayName}</span>
      </Button>

      <Dropdown.Popover className="rounded-2xl border border-stone-200/80 bg-white/95 backdrop-blur-md p-1.5 shadow-xl min-w-44 z-50">
        <Dropdown.Menu>
          <Dropdown.Item
            id="my-history"
            textValue={historyLabel}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 data-[focused=true]:bg-cyan-50 cursor-pointer"
          >
            <Link
              href={APP_ROUTES.APPOINTMENTS}
              className="flex items-center gap-2 w-full"
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>{historyLabel}</span>
            </Link>
          </Dropdown.Item>

          <Dropdown.Item
            id="sign-out"
            textValue={signOutLabel}
            onClick={() => authService.logout()}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 data-[focused=true]:bg-rose-50 cursor-pointer"
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
