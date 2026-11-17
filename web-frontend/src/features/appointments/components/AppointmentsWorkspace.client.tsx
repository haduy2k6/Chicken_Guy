"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  User,
  PlusCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import { UserUI } from "@/src/StoreUser/Global/UserUI";
import { patientService } from "@/src/features/patient/services/patient.service";
import { PatientHistoryItem } from "@/src/features/patient/types";

export function AppointmentsWorkspace() {
  const isSignIn = useAuthStore((s) => s.isSignIn || s.isLogin);
  const user = useAuthStore((s) => s.user);
  const setSignInPopup = UserUI((s) => s.setSignInPopup);

  const [history, setHistory] = useState<PatientHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignIn) return;

    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await patientService.getHistory();
        if (isMounted) {
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Không thể tải lịch sử khám bệnh");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [isSignIn]);

  if (!isSignIn) {
    return (
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-lg text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-sm">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            Xem Lịch Khám & Kết Quả Chẩn Đoán
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Vui lòng đăng nhập để đồng bộ và truy cập toàn bộ hồ sơ khám bệnh, lịch sử tầm soát ung thư và ý kiến chuyên môn của bác sĩ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSignInPopup(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 text-white font-bold text-xs sm:text-sm hover:bg-stone-800 transition-all cursor-pointer shadow-md"
        >
          <User className="w-4 h-4" />
          <span>Đăng Nhập Ngay</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-stone-900">
            Hồ Sơ Của {user?.name || "Bệnh Nhân"}
          </h2>
          <p className="text-xs text-stone-500">
            {user?.email || "Tài khoản bệnh nhân"} • Tổng số lần sàng lọc: {history.length}
          </p>
        </div>

        <Link
          href={APP_ROUTES.PATIENT.ROOT}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Sàng Lọc Mới</span>
        </Link>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-amber-600 mb-3" />
            <p className="text-sm font-semibold text-stone-600">Đang tải hồ sơ bệnh án...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/80 shadow-xs space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-stone-800">Chưa có lịch sử khám nào</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Bạn chưa có lượt sàng lọc hoặc gửi ảnh chẩn đoán nào. Hãy thực hiện tầm soát đầu tiên bằng công nghệ AI ngay hôm nay.
            </p>
            <div className="pt-2">
              <Link
                href={APP_ROUTES.PATIENT.ROOT}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
              >
                <span>Bắt Đầu Tầm Soát</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-800">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      Đợt Sàng Lọc Ung Thư Vòm Họng #{item.id.slice(0, 8)}
                    </h4>
                    <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.submissionDate).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    item.status === "pending"
                      ? "bg-amber-100 text-amber-900"
                      : item.status === "escalated"
                      ? "bg-rose-100 text-rose-900"
                      : "bg-emerald-100 text-emerald-900"
                  }`}
                >
                  {item.status === "pending"
                    ? "Đang chờ bác sĩ"
                    : item.status === "escalated"
                    ? "Cần khám chuyên khoa"
                    : "Đã có kết luận"}
                </span>
              </div>

              {item.diagnosisNotes ? (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700 space-y-1">
                  <p className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-700" />
                    <span>Ý kiến chuyên môn của Bác sĩ:</span>
                  </p>
                  <p className="leading-relaxed pl-5">{item.diagnosisNotes}</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Dữ liệu và ảnh chẩn đoán đang được chuyên gia y tế thẩm định.</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AppointmentsWorkspace;
