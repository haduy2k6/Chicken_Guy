"use client";

import { useState } from "react";
import { userTheme } from "@/src/Store/userThemeStore";
import { userAuth } from "@/src/Store/useAuthStore";
import { authService } from "@/src/Services/auth.service";
import { X, User, Stethoscope, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SignIn() {
  const signInPopUp = userTheme((state) => state.signInPopUp);
  const setSignInPopup = userTheme((state) => state.setSignInPopup);
  const setSignIn = userAuth((state) => state.setSignIn);

  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!signInPopUp) return null;

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSignIn();
      setSignInPopup(false);
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn"
      onClick={() => setSignInPopup(false)}
    >
      <section 
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-orange-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-center text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setSignInPopup(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-linear-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-3">
            <User className="w-6 h-6" /> 
          </div>
          <h2 className="text-xl font-black text-stone-900">Đăng Nhập Hệ Thống</h2>
          <p className="text-xs text-stone-500">
            Nền tảng Y Tế AI Tầm Soát Ung Thư Vòm Họng
          </p>
        </div>


        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button 
            type="button"
            onClick={() => authService.loginWithGoogle()}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700 text-xs hover:bg-stone-100 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button 
            type="button"
            onClick={() => handleLoginSubmit()}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-[#1877F2] rounded-xl font-semibold text-white text-xs hover:bg-[#166fe5] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        <p className="text-[11px] text-center text-stone-400 mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Dữ liệu y tế được bảo mật theo tiêu chuẩn HIPAA
        </p>
      </section>
    </div>
  );
}