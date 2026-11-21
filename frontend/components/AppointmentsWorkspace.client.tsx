"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, CalendarCheck, CheckCircle2, Clock, FileText, Loader2,
  PlusCircle, RefreshCw, Share2, ShieldCheck, Stethoscope,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import { useAuthStore } from "@/src/stores/authStore";
import { useConfirmReferralMutation, usePatientHistoryQuery } from "@/src/query/usePatientQueries";
import type { CaseStatus, PatientHistoryAppointment, PatientHistoryItem, QuotaState } from "@/src/features/patient/types";
import { fmtDateTime } from "@/src/lib/date";
import { errMsg } from "@/src/lib/httpError";
import { formatAiLabel } from "@/src/lib/formatAiLabel";
import { BookAppointment } from "./BookAppointment.client";

const isActiveAppt = (a: PatientHistoryAppointment | null): a is PatientHistoryAppointment =>
  !!a && (a.status === "scheduled" || a.status === "confirmed");
const EMPTY_HISTORY: PatientHistoryItem[] = [];

/** Trang này được bọc <RoleGate role="patient">, nên ở đây luôn có bệnh nhân đã đăng nhập */
export function AppointmentsWorkspace() {
  const t = useTranslations("AppointmentsWorkspace");
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, refetch, isFetching } = usePatientHistoryQuery();
  const history = data?.items ?? EMPTY_HISTORY;
  const quota = data?.quota;

  const statusMeta: Record<CaseStatus, { label: string; className: string }> = {
    pending: { label: t("status.pending"), className: "bg-amber-100 text-amber-900" },
    reviewed: { label: t("status.reviewed"), className: "bg-emerald-100 text-emerald-900" },
    escalated: { label: t("status.escalated"), className: "bg-rose-100 text-rose-900" },
  };

  const upcoming = useMemo(() => {
    return history
      .filter((i) => isActiveAppt(i.appointment))
      .sort((a, b) => new Date(a.appointment!.scheduledAt).getTime() - new Date(b.appointment!.scheduledAt).getTime());
  }, [history]);

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-stone-900">{t("profileOf", { name: user?.name || t("defaultPatient") })}</h2>
          <p className="text-xs text-stone-500">
            {user?.email || t("patientAccount")}
            {quota ? ` • ${t("usedQuota", { used: quota.used, max: quota.max })}` : ""}
          </p>
        </div>

        {quota?.blocked ? (
          <span className="text-xs font-semibold text-rose-800 max-w-56">
            {t("quotaBlocked")}
          </span>
        ) : (
          <Link
            href={APP_ROUTES.PATIENT}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t("newScreening")}</span>
          </Link>
        )}
      </div>

      {upcoming.length > 0 && (
        <section className="space-y-3" aria-label={t("upcomingTitle")}>
          <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-cyan-700" />
            {t("upcomingTitle")}
          </h3>
          {upcoming.map((item) => {
            const a = item.appointment!;
            return (
              <div key={a.id} className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-stone-900">{fmtDateTime(a.scheduledAt)}</p>
                  <p className="text-xs text-stone-600">
                    {a.doctorName ? a.doctorName : t("attendingDoctor")}
                    {a.hospital ? ` • ${a.hospital}` : ""}
                  </p>
                  {a.note && <p className="text-xs text-stone-500">{a.note}</p>}
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-900 uppercase tracking-wider shrink-0">
                  {a.status === "confirmed" ? t("confirmed") : t("scheduled")}
                </span>
              </div>
            );
          })}
        </section>
      )}

      <section className="space-y-4" aria-label={t("recordsTitle")}>
        <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-700" />
          {t("recordsTitle")}
        </h3>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-amber-600 mb-3" />
            <p className="text-sm font-semibold text-stone-600">Đang tải hồ sơ bệnh án...</p>
          </div>
        ) : error ? (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-800 flex items-center justify-between gap-3">
            <span>{errMsg(error)}</span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 text-xs font-bold underline-offset-2 hover:underline cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Thử lại
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/80 shadow-xs space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-stone-800">Chưa có lịch sử khám nào</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Bạn chưa có lượt sàng lọc hoặc gửi ảnh chẩn đoán nào. Hãy thực hiện tầm soát đầu tiên bằng công nghệ AI ngay hôm nay.
            </p>
            <div className="pt-2">
              <Link href={APP_ROUTES.PATIENT} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800">
                <span>{t("newScreening")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          history.map((item) => (
            <CaseCard key={item.id} item={item} statusMeta={statusMeta} eviction={quota?.eviction?.caseId === item.id ? quota.eviction : null} />
          ))
        )}
      </section>
    </div>
  );
}

function CaseCard({ item, statusMeta, eviction }: { item: PatientHistoryItem; statusMeta: Record<CaseStatus, { label: string; className: string }>; eviction: QuotaState["eviction"] }) {
  const confirmReferral = useConfirmReferralMutation();
  const [armed, setArmed] = useState(false);
  const meta = statusMeta[item.status];
  const appt = isActiveAppt(item.appointment) ? item.appointment : null;

  return (
    <article className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-800">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm">
              Đợt khám {item.specialtyName ?? "sàng lọc"} #{item.id.slice(0, 8)}
            </h4>
            <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              {fmtDateTime(item.submissionDate)}
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${meta.className}`}>{meta.label}</span>
      </div>

      {item.status === "pending" || !item.review ? (
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Dữ liệu và ảnh chẩn đoán đang được chuyên gia y tế thẩm định.</span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700 space-y-1">
          <p className="font-bold text-stone-900 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-700" />
            <span>
              Ý kiến chuyên môn{item.review.doctorName ? ` của ${item.review.doctorName}` : ""}
              {item.review.hospital ? ` (${item.review.hospital})` : ""}
            </span>
          </p>
          <p className="leading-relaxed pl-5 whitespace-pre-line">{item.review.notes}</p>
          <p className="pl-5 text-[11px] text-stone-400">Kết luận lúc {fmtDateTime(item.review.reviewedAt)}</p>
        </div>
      )}

      {item.results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-800">Kết quả hỗ trợ từ AI</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {item.results.map((result, index) => (
              <div key={`${item.id}-result-${index}`} className="flex gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3">
                <a href={result.imageUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  <img src={result.gradcamUrl ?? result.imageUrl} alt={result.gradcamUrl ? "Ảnh Grad-CAM" : "Ảnh đã gửi"} className="h-20 w-20 rounded-lg object-cover" />
                </a>
                <div className="text-xs text-stone-600">
                  {result.status === "completed" ? (
                    <>
                      <p className="font-semibold text-stone-900">{formatAiLabel(result.predictedLabel)}</p>
                      {result.riskScore !== null && <p>Điểm mô hình: {result.riskScore.toFixed(1)}%</p>}
                      {result.gradcamUrl && <a href={result.gradcamUrl} target="_blank" rel="noreferrer" className="text-cyan-800 underline">Xem vùng AI chú ý</a>}
                    </>
                  ) : <p>{result.status === "failed" ? "Phân tích ảnh thất bại" : "Đang phân tích ảnh"}</p>}
                  <p className="mt-1 text-[10px] text-stone-400">Điểm model không phải xác suất mắc bệnh; bác sĩ cần tự đánh giá và kết luận.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {item.status === "reviewed" &&
        (appt ? (
          <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 text-xs text-cyan-900 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span>Lịch tái khám: {fmtDateTime(appt.scheduledAt)}</span>
          </div>
        ) : (
          <BookAppointment caseId={item.id} />
        ))}

      {item.status === "escalated" && (
        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-rose-900 space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span>{item.referral?.targetLabel ? `Chuyển tuyến tới: ${item.referral.targetLabel}` : "Hồ sơ đã được chuyển tuyến"}</span>
          </p>
          {item.referral?.reason && <p className="pl-5 leading-relaxed">{item.referral.reason}</p>}
          {!armed ? (
            <button type="button" onClick={() => setArmed(true)} className="ml-5 mt-1 px-3 py-1.5 rounded-lg bg-rose-700 text-white font-bold hover:bg-rose-800 cursor-pointer">
              Xác nhận chuyển tuyến
            </button>
          ) : (
            <div className="ml-5 mt-1 space-y-2">
              <p className="flex items-start gap-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Sau khi xác nhận, hồ sơ này sẽ bị xóa khỏi hệ thống và không thể khôi phục. Hãy lưu lại thông tin chuyển tuyến trước.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={confirmReferral.isPending}
                  onClick={() => confirmReferral.mutate(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white font-bold hover:bg-rose-800 disabled:opacity-60 cursor-pointer"
                >
                  {confirmReferral.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Đồng ý xác nhận
                </button>
                <button type="button" disabled={confirmReferral.isPending} onClick={() => setArmed(false)} className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white font-bold cursor-pointer">
                  Hủy
                </button>
              </div>
            </div>
          )}

          {confirmReferral.isError && (
            <p role="alert" className="ml-5 text-red-700 font-semibold">{errMsg(confirmReferral.error)}</p>
          )}
        </div>
      )}

      {eviction && (
        <p className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          {eviction.reason === "reviewed"
            ? "Hồ sơ này sẽ tự động bị xóa khi bạn gửi hồ sơ mới."
            : "Hồ sơ này sẽ bị thay thế khi bạn gửi hồ sơ mới."}
        </p>
      )}
    </article>
  );
}

export default AppointmentsWorkspace;
