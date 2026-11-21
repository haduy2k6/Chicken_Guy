"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/src/stores/authStore";
import { useUiStore } from "@/src/stores/uiStore";
import { authService } from "@/src/features/auth/auth.service";
import { APP_ROUTES } from "@/src/config/routes.config";
import { useRouter } from "@/src/i18n/routing";
import { Button, Dropdown, Label } from "@heroui/react";
import { LogOut, FileText, Stethoscope, Sparkles } from "lucide-react";
import Image from "next/image";

export function MenuAuthActions({ signInLabel, signOutLabel, historyLabel }: {
  signInLabel: string;
  signOutLabel: string;
  historyLabel: string;
}) {
  const t = useTranslations("Home.Menu");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setSignInPopUp = useUiStore((s) => s.setSignInPopUp);

  if (!user) {
    return (
      <Button
        variant="secondary"
        onClick={() => setSignInPopUp(true)}
        className="rounded-xl font-bold text-xs sm:text-sm px-4 py-2 bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
      >
        {signInLabel}
      </Button>
    );
  }

  const isDoctor = user.role === "doctor";

  return (
    <Dropdown>
      <Button
        variant="secondary"
        className="rounded-xl font-bold text-xs sm:text-sm px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center gap-2 cursor-pointer shadow-xs border border-stone-200/60"
      >
        {user.avatar ? (
          <Image src={user.avatar} width={20} height={20} alt={user.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-600/30" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px] font-black">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-w-28 truncate">{user.name}</span>
      </Button>

      <Dropdown.Popover className="rounded-2xl border border-stone-200/80 bg-white p-1.5 shadow-xl min-w-52 z-50">
        <div className="px-3 py-2 border-b border-stone-100 mb-1">
          <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
          {user.email && <p className="text-[11px] text-stone-500 truncate">{user.email}</p>}
          <p className="text-[10px] font-semibold text-cyan-700 mt-0.5">
            {isDoctor ? t("doctorAccount") : t("patientAccount")}
          </p>
        </div>

        <Dropdown.Menu
          onAction={(key) => {
            if (key === "sign-out") void authService.logout();
            else router.push(String(key));
          }}
        >
          <Dropdown.Item id={isDoctor ? APP_ROUTES.DOCTOR : APP_ROUTES.PATIENT} textValue={t("mainFeatures")}>
            {isDoctor ? <Stethoscope className="w-3.5 h-3.5 text-cyan-700" /> : <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
            <Label>{isDoctor ? t("doctorWorkspace") : t("cancerScreening")}</Label>
          </Dropdown.Item>

          {!isDoctor ? (
            <Dropdown.Item id={APP_ROUTES.APPOINTMENTS} textValue={historyLabel}>
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <Label>{historyLabel}</Label>
            </Dropdown.Item>
          ) : null}

          <Dropdown.Item id="sign-out" textValue={signOutLabel} variant="danger">
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <Label>{signOutLabel}</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export default MenuAuthActions;
