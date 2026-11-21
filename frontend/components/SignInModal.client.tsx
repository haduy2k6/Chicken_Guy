"use client";

import { useTranslations } from "next-intl";
import { X, User, ShieldCheck } from "lucide-react";
import { useUiStore } from "@/src/stores/uiStore";
import { GoogleSignInButton } from "./GoogleSignInButton.client";

export function SignInModal() {
  const t = useTranslations("Auth");
  const open = useUiStore((s) => s.signInPopUp);
  const setOpen = useUiStore((s) => s.setSignInPopUp);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn" onClick={() => setOpen(false)}>
      <section
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-center text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={t("close")}
          onClick={() => setOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-linear-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30 mb-3">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-stone-900">{t("title")}</h2>
          <p className="text-xs text-stone-500">{t("subtitle")}</p>
        </div>

        <GoogleSignInButton
          label={t("googleButton")}
          className="w-full px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 text-sm font-semibold hover:bg-stone-100 shadow-xs"
        />

        <p className="text-[11px] text-center text-stone-400 mt-5 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          {t("encryptionNotice")}
        </p>
      </section>
    </div>
  );
}

export default SignInModal;
