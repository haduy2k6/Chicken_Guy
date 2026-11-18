"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stethoscope, AlertTriangle, RefreshCw, CheckCircle2, X } from "lucide-react";
import { useDoctorStore } from "@/src/stores/doctorStore";
import { useAuthStore } from "@/src/stores/authStore";
import {
  useDoctorCaseDetailQuery,
  useDoctorQueueQuery,
  usePrefetchDoctorCase,
  useReviewCaseMutation,
} from "@/src/query/useDoctorQueries";
import { useReferralTargetsQuery } from "@/src/query/useReferralTargetsQuery";
import { errMsg } from "@/src/lib/httpError";
import { DoctorPatientQueue } from "@/src/features/doctor/DoctorPatientQueue";
import { PatientCaseDetailPanel } from "./PatientCaseDetailPanel";
import { DoctorSchedulePanel } from "./DoctorSchedulePanel.client";

export function DoctorWorkspace() {
  const filterStatus = useDoctorStore((s) => s.filterStatus);
  const filterSpecialty = useDoctorStore((s) => s.filterSpecialty);
  const selectedCaseId = useDoctorStore((s) => s.selectedCaseId);
  const setFilterStatus = useDoctorStore((s) => s.setFilterStatus);
  const setFilterSpecialty = useDoctorStore((s) => s.setFilterSpecialty);
  const selectCaseId = useDoctorStore((s) => s.selectCaseId);
  const clearDraft = useDoctorStore((s) => s.clearDraft);

  const userName = useAuthStore((s) => s.user?.name);

  const { data: queueData, isLoading: isQueueLoading, isRefetching, error: queueError, refetch: refetchQueue } = useDoctorQueueQuery();
  const { data: detail, isLoading: isDetailLoading, error: detailError, refetch: refetchDetail } = useDoctorCaseDetailQuery(selectedCaseId);

  const prefetchCase = usePrefetchDoctorCase();
  const reviewMutation = useReviewCaseMutation();

  const items = queueData?.items ?? [];
  const pendingCount = queueData?.pendingCount ?? 0;
  const summary = items.find((i) => i.id === selectedCaseId) ?? null;

  const { data: referralTargets = [] } = useReferralTargetsQuery(selectedCaseId !== null);

  // Ghi nhớ version bác sĩ đã xem; nếu server có bản mới hơn thì báo để bác sĩ xác nhận trước khi gửi
  const [seen, setSeen] = useState<{ caseId: string; version: number } | null>(null);

  const seenVersion = detail && seen?.caseId === detail.id ? seen.version : detail?.version;
  const hasNewerVersion = !!detail && seen?.caseId === detail.id && detail.version !== seen.version;

  const acceptNewVersion = useCallback(() => {
    if (detail) setSeen({ caseId: detail.id, version: detail.version });
  }, [detail]);

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSelectCase = useCallback(
    (id: string) => {
      setErrorMessage(null);
      setSeen(null);
      void selectCaseId(id);
    },
    [selectCaseId]
  );

  const handleClose = useCallback(() => {
    setErrorMessage(null);
    void selectCaseId(null);
  }, [selectCaseId]);

  const handleSubmit = async () => {
    if (!detail || seenVersion === undefined) return;
    setErrorMessage(null);

    const draft = useDoctorStore.getState().reviewDraft;
    const caseId = detail.id;

    try {
      await reviewMutation.mutateAsync({
        caseId,
        expectedVersion: seenVersion,
        status: draft.status,
        notes: draft.notes,
        assessmentData: draft.assessmentData,
        followUpDate: draft.status === "reviewed" && draft.followUpDate ? draft.followUpDate : undefined,
        referral: draft.status === "escalated" ? draft.referral : undefined,
      });

      await clearDraft(caseId);
      await selectCaseId(null);
      showToast(
        draft.status === "escalated"
          ? `Đã chuyển tuyến ca #${caseId.slice(0, 8)}. Ca không còn trong danh sách của bạn.`
          : `Đã lưu kết luận cho ca #${caseId.slice(0, 8)}.`
      );
    } catch (err: unknown) {
      setErrorMessage(errMsg(err, "Không gửi được kết luận. Hãy thử lại."));
    }
  };

  const error = errorMessage ?? (queueError ? errMsg(queueError, "Không tải được danh sách ca bệnh.") : null);
  const loadError = detailError ? errMsg(detailError, "Không tải được hồ sơ ca bệnh.") : null;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-700" />
            <span>Khu vực bác sĩ chuyên khoa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Hàng đợi ca khám</h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Bác sĩ: <span className="font-semibold text-stone-800">{userName || "Bác sĩ chuyên khoa"}</span>
            {" · "}
            {pendingCount > 0 ? (
              <span className="text-amber-700 font-bold">{pendingCount} ca đang chờ đánh giá</span>
            ) : queueData ? (
              <span className="text-emerald-700 font-medium">Không còn ca nào chờ đánh giá</span>
            ) : (
              <span className="text-stone-400">Đang tải...</span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetchQueue()}
          disabled={isQueueLoading || isRefetching}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isQueueLoading || isRefetching ? "animate-spin" : ""}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {successToast && (
        <div role="status" className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm text-emerald-900 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} aria-label="Đóng thông báo" className="cursor-pointer">
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-300 bg-rose-50 px-5 py-3 text-sm text-rose-900 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={selectedCaseId ? "lg:col-span-6" : "lg:col-span-12"}>
          <DoctorPatientQueue
            items={items}
            selectedCaseId={selectedCaseId}
            filterStatus={filterStatus}
            filterSpecialty={filterSpecialty}
            isLoading={isQueueLoading}
            onSelectFilterStatus={setFilterStatus}
            onSelectFilterSpecialty={setFilterSpecialty}
            onSelectCase={handleSelectCase}
            onPrefetchCase={prefetchCase}
          />
        </div>

        {selectedCaseId && (
          <div className="lg:col-span-6">
            <PatientCaseDetailPanel
              summary={summary}
              detail={detail}
              isLoading={isDetailLoading}
              loadError={loadError}
              isSubmitting={reviewMutation.isPending}
              hasNewerVersion={hasNewerVersion}
              referralTargets={referralTargets}
              onRetry={() => void refetchDetail()}
              onAcceptNewVersion={acceptNewVersion}
              onSubmit={handleSubmit}
              onClose={handleClose}
            />
          </div>
        )}
      </div>

      <DoctorSchedulePanel />
    </div>
  );
}

export default DoctorWorkspace;
