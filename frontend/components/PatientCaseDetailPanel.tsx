"use client";

import { useEffect, useState } from "react";
import {
  X,
  FileText,
  Send,
  Loader2,
  Calendar,
  Image as ImageIcon,
  ClipboardList,
  AlertCircle,
  Maximize2,
  FileIcon,
  RefreshCw,
} from "lucide-react";
import {
  GENDER_LABEL,
  type CaseImageDto,
  type DoctorCaseDetail,
  type PatientQueueItem,
} from "@/src/features/doctor/types";
import { useDoctorStore } from "@/src/stores/doctorStore";
import type { ReferralTarget } from "@/src/query/useReferralTargetsQuery";
import { describeIntake } from "@/src/features/doctor/intakeLabels";
import { formatAiLabel } from "@/src/lib/formatAiLabel";
import { AiRiskBadge } from "@/src/features/doctor/DoctorPatientQueue";


const toLocalInput = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

interface Props {

  summary: PatientQueueItem | null;
  detail: DoctorCaseDetail | undefined;
  isLoading: boolean;
  loadError: string | null;
  isSubmitting: boolean;

  hasNewerVersion: boolean;
  referralTargets: ReferralTarget[];
  onRetry: () => void;
  onAcceptNewVersion: () => void;
  onSubmit: () => Promise<void>;
  onClose: () => void;
}

export function PatientCaseDetailPanel({
  summary,
  detail,
  isLoading,
  loadError,
  isSubmitting,
  hasNewerVersion,
  referralTargets,
  onRetry,
  onAcceptNewVersion,
  onSubmit,
  onClose,
}: Props) {
  const reviewDraft = useDoctorStore((s) => s.reviewDraft);
  const updateDraft = useDoctorStore((s) => s.updateDraft);

  const [preview, setPreview] = useState<CaseImageDto | null>(null);
  const [showGradcam, setShowGradcam] = useState(false);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const info = detail ?? summary;
  if (!info) return null;

  const isEscalated = reviewDraft.status === "escalated";
  const referral = reviewDraft.referral;
  const referralValue = referral?.toDoctorId
    ? `doctor:${referral.toDoctorId}`
    : referral?.toSpecialtyId
      ? `specialty:${referral.toSpecialtyId}`
      : "";
  const hasReceiver = Boolean(referral?.toDoctorId || referral?.toSpecialtyId);

  const canSubmit =
    !!detail &&
    !isSubmitting &&
    reviewDraft.notes.trim().length > 0 &&
    (!isEscalated || hasReceiver);

  const openPreview = (img: CaseImageDto) => {
    setShowGradcam(false);
    setPreview(img);
  };

  const onPickReceiver = (value: string) => {
    if (!value) return updateDraft({ referral: undefined });
    const [kind, id] = value.split(":");
    updateDraft({
      referral: kind === "doctor" ? { toDoctorId: id } : { toSpecialtyId: id },
    });
  };

  const intakeEntries = detail ? describeIntake(detail.intakeData ?? {}) : [];

  return (
    <>
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-lg sticky top-24 space-y-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-700" />
            <div>
              <h3 className="font-black text-stone-900 text-base">Hồ sơ và đánh giá chuyên môn</h3>
              <p className="text-[11px] text-stone-400 font-mono">Mã ca: #{info.id.slice(0, 8)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hồ sơ"
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasNewerVersion && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p>Ca này vừa được cập nhật ở nơi khác. Nội dung bên dưới có thể đã đổi.</p>
              <button
                type="button"
                onClick={onAcceptNewVersion}
                className="font-bold underline cursor-pointer"
              >
                Đã xem, dùng bản mới nhất
              </button>
            </div>
          </div>
        )}

        <div className="bg-stone-50 rounded-2xl p-4 space-y-2 border border-stone-100 text-xs sm:text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-stone-500">Bệnh nhân:</span>
            <span className="font-bold text-stone-900 text-right">
              {info.name} ({info.age} tuổi, {GENDER_LABEL[info.gender]})
            </span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-stone-200/60">
            <span className="text-stone-500 font-medium">Phân tích AI tổng hợp:</span>
            <AiRiskBadge score={info.aiRiskScore} status={info.aiStatus} />
          </div>
        </div>

        {loadError ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tải lại hồ sơ
            </button>
          </div>
        ) : isLoading || !detail ? (
          <div className="py-10 text-center text-sm text-stone-500">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-cyan-600 mb-2" />
            Đang tải hồ sơ ca bệnh...
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <ClipboardList className="w-4 h-4 text-cyan-700" />
                <span>Triệu chứng và khai báo của bệnh nhân</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-50/40 border border-cyan-100 space-y-3 text-xs text-stone-700">
                {detail.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {detail.symptoms.map((sym) => (
                      <span
                        key={sym}
                        className="px-2.5 py-1 rounded-lg bg-white border border-cyan-200 text-cyan-900 font-medium"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>
                )}

                <p className="leading-relaxed text-stone-600">
                  {detail.patientNote?.trim() || "Bệnh nhân không ghi chú thêm."}
                </p>

                {intakeEntries.length > 0 && (
                  <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-x-3 gap-y-1.5 pt-2 border-t border-cyan-100">
                    {intakeEntries.map(({ key, label, value }) => (
                      <div key={key} className="contents">
                        <dt className="text-stone-500 break-words">{label}</dt>
                        <dd className="font-medium text-stone-800 break-words">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <ImageIcon className="w-4 h-4 text-cyan-700" />
                <span>Ảnh nội soi và tài liệu ({detail.images.length})</span>
              </div>

              {detail.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {detail.images.map((img, idx) =>
                    img.kind === "document" ? (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-xl border border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-stone-600 hover:bg-stone-100"
                      >
                        <FileIcon className="w-5 h-5 text-stone-400" />
                        Mở tài liệu
                      </a>
                    ) : (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => openPreview(img)}
                        aria-label={`Phóng to ảnh ${idx + 1}`}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer"
                      >
                        <img
                          src={img.thumbUrl ?? img.url}
                          alt={`Ảnh hồ sơ ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {img.analysis && (
                          <span className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[10px] font-semibold px-1.5 py-0.5 truncate">
                            {img.analysis.status === "completed" && img.analysis.riskScore !== null
                              ? `Model ${Math.round(img.analysis.riskScore * 10) / 10}%`
                              : img.analysis.status === "failed"
                                ? "AI lỗi"
                                : "Đang phân tích"}
                            {img.analysis.gradcamUrl ? " · Grad-CAM" : ""}
                          </span>
                        )}
                      </button>
                    )
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
                  Ca này không có ảnh hoặc tài liệu đính kèm
                </div>
              )}
            </div>

            {detail.status !== "pending" ? (
              <p className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                Ca này đã được xử lý, chỉ xem lại nội dung, không thể kết luận lần nữa.
              </p>
            ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) void onSubmit();
              }}
              className="space-y-4 pt-2 border-t border-stone-100"
            >
              <div>
                <label htmlFor="review-notes" className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nhận xét và kết luận chuyên môn
                </label>
                <textarea
                  id="review-notes"
                  rows={4}
                  placeholder="Nhập chẩn đoán lâm sàng, chỉ định cận lâm sàng hoặc dặn dò bệnh nhân..."
                  value={reviewDraft.notes}
                  onChange={(e) => updateDraft({ notes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-stone-50/50"
                  required
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-stone-700 mb-1.5">Hướng xử lý</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft({
                        status: "reviewed",
                        assessmentFormVersion: detail.assessmentFormVersion,
                      })
                    }
                    aria-pressed={!isEscalated}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      !isEscalated
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Duyệt và hẹn tái khám
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft({
                        status: "escalated",
                        assessmentFormVersion: detail.assessmentFormVersion,
                      })
                    }
                    aria-pressed={isEscalated}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isEscalated
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Chuyển tuyến
                  </button>
                </div>
              </div>

              {!isEscalated && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <label
                    htmlFor="follow-up"
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-900"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Hẹn khám trực tiếp hoặc tái khám (không bắt buộc)</span>
                  </label>
                  <input
                    id="follow-up"
                    type="datetime-local"
                    value={reviewDraft.followUpDate || ""}
                    min={toLocalInput(new Date())}
                    onChange={(e) => updateDraft({ followUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <p className="text-[11px] text-emerald-700">
                    Lịch hẹn sẽ hiện trong hồ sơ theo dõi của bệnh nhân.
                  </p>
                </div>
              )}

              {isEscalated && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <label htmlFor="referral-target" className="block text-xs font-bold text-rose-900">
                    Chuyển đến bác sĩ hoặc khoa
                  </label>
                  <select
                    id="referral-target"
                    value={referralValue}
                    onChange={(e) => onPickReceiver(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  >
                    <option value="">Chọn người nhận...</option>
                    {referralTargets.map((t) => (
                      <option key={`${t.kind}:${t.id}`} value={`${t.kind}:${t.id}`}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {referralTargets.length === 0 && (
                    <p className="text-[11px] text-rose-700">
                      Chưa tải được danh sách người nhận, không thể chuyển tuyến lúc này.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isEscalated ? "Gửi chuyển tuyến" : "Lưu kết luận"}</span>
              </button>
            </form>
            )}
          </>
        )}
      </div>

      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label="Đóng"
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={showGradcam && preview.analysis?.gradcamUrl ? preview.analysis.gradcamUrl : preview.url}
              alt={showGradcam ? "Bản đồ nhiệt Grad-CAM" : "Ảnh nội soi phóng to"}
              className="max-h-[72vh] w-auto mx-auto object-contain"
            />

            {preview.analysis && (
              <div className="px-4 py-3 bg-stone-800 text-xs text-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {formatAiLabel(preview.analysis.predictedLabel)}
                  </p>
                  <p className="text-stone-300">
                    {preview.analysis.status === "completed" && preview.analysis.riskScore !== null
                      ? `Điểm model (không phải xác suất bệnh): ${Math.round(preview.analysis.riskScore * 10) / 10}%`
                      : preview.analysis.status === "failed"
                        ? "AI phân tích ảnh này bị lỗi"
                        : "AI đang phân tích ảnh này"}
                  </p>
                </div>
                {preview.analysis.gradcamUrl && (
                  <button
                    type="button"
                    onClick={() => setShowGradcam((v) => !v)}
                    aria-pressed={showGradcam}
                    className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 font-bold cursor-pointer"
                  >
                    {showGradcam ? "Xem ảnh gốc" : "Xem vùng AI chú ý (Grad-CAM)"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
