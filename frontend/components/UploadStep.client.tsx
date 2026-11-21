"use client";

import { useState } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Status, usePatientStore } from "@/src/stores/patientStore";
import { DropZone } from "./DropZone.client";
import { PatientForm, PATIENT_FORM_ID } from "./PatientForm.client";
import { usePatientQuota, useSubmitPatientMutation } from "@/src/query/usePatientQueries";
import { BLOCKED_MESSAGE, describeEviction, shortId, type QuotaState } from "@/src/features/patient/Quota";
import { errMsg } from "@/src/lib/httpError";

/** Luồng này gửi hồ sơ khoa ung bướu (mã khoa khớp backend case-support/intake-schema.ts) */
const SPECIALTY = "oncology";
const STEPS = ["upload", "info"] as const;

const BTN =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

export function UploadStep() {
  const t = useTranslations("Patient");
  const status = usePatientStore((s) => s.status);
  const goToForm = usePatientStore((s) => s.goToForm);
  const backToUpload = usePatientStore((s) => s.backToUpload);
  const storageError = usePatientStore((s) => s.error);
  const submissionSuccessMsg = usePatientStore((s) => s.submissionSuccessMsg);
  const setSubmissionSuccess = usePatientStore((s) => s.setSubmissionSuccess);
  const submitMutation = useSubmitPatientMutation();
  const quota = usePatientQuota();
  const [error, setError] = useState<string | null>(null);

  const step = status === Status.post ? 1 : 0;
  const isSubmitting = submitMutation.isPending;

  const handleSubmit = async (values: Record<string, string>) => {
    const { files } = usePatientStore.getState();
    setError(null);

    // Hạn mức do backend tính; ở đây chỉ báo trước. Backend vẫn là nơi quyết định cuối cùng.
    if (quota.blocked) {
      setError(BLOCKED_MESSAGE);
      return;
    }
    // Xóa hồ sơ cũ không hoàn tác được nên luôn hỏi lại
    if (quota.eviction && !window.confirm(`${describeEviction(quota.eviction)}\n\nTiếp tục gửi?`)) return;

    try {
      const res = await submitMutation.mutateAsync({ specialty: SPECIALTY, files, formValues: values });
      const base = res.message || "Gửi hồ sơ và hình ảnh thành công!";
      setSubmissionSuccess(res.evictedCaseId ? `${base} (Đã xóa hồ sơ cũ ${shortId(res.evictedCaseId)})` : base);
    } catch (err) {
      setError(errMsg(err, t("actions.error")));
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5 rounded-2xl bg-white/70 p-4 shadow-lg ring-1 ring-amber-900/10 backdrop-blur-md sm:p-6">
      <Stepper current={step} />

      <QuotaNotice quota={quota} />

      {submissionSuccessMsg && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 font-medium animate-fadeIn">
          ✓ {submissionSuccessMsg}
        </div>
      )}

      {storageError && (
        <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          {storageError}
        </p>
      )}

      {step === 0 ? <DropZone /> : <PatientForm onSubmit={handleSubmit} />}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {step === 1 && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={backToUpload}
            className={`${BTN} border border-amber-900/20 bg-white text-amber-950 hover:bg-amber-50 cursor-pointer`}
          >
            {t("actions.back")}
          </button>
        )}

        <button
          type={step === 0 ? "button" : "submit"}
          form={PATIENT_FORM_ID}
          disabled={status === Status.empty || isSubmitting || quota.blocked}
          onClick={step === 0 ? goToForm : undefined}
          className={`${BTN} bg-red-800 text-amber-50 shadow-sm hover:bg-red-900 disabled:bg-amber-900/15 disabled:text-amber-900/50 disabled:shadow-none cursor-pointer`}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {step === 0 ? t("actions.next") : isSubmitting ? t("actions.submitting") : t("actions.submit")}
        </button>
      </div>
    </div>
  );
}

function QuotaNotice({ quota }: { quota: QuotaState & { known: boolean } }) {
  const t = useTranslations("Patient");
  if (!quota.known || quota.used === 0) return null;

  if (quota.blocked) {
    return (
      <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>{BLOCKED_MESSAGE}</span>
      </p>
    );
  }

  if (quota.eviction) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>{describeEviction(quota.eviction)}</span>
      </p>
    );
  }

  return (
    <p className="text-xs text-amber-900/70">
      {t("quotaUsed", { used: quota.used, max: quota.max })}
    </p>
  );
}

function Stepper({ current }: { current: number }) {
  const t = useTranslations("Patient.steps");
  return (
    <ol className="flex w-full items-center gap-3">
      {STEPS.map((key, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={key} aria-current={active ? "step" : undefined} className="flex flex-1 items-center gap-2.5 last:flex-none">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                done || active ? "bg-red-800 text-amber-50" : "bg-amber-900/10 text-amber-900/60"
              }`}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span className={`text-sm ${active ? "font-semibold text-red-900" : "text-amber-900/60"}`}>{t(key)}</span>
            {i < STEPS.length - 1 && <span className={`h-px flex-1 transition-colors ${done ? "bg-red-800" : "bg-amber-900/20"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export default UploadStep;
