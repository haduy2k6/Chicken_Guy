"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Status, usePatientStore } from "@/src/Store/usePatientStore";
import { Dropzone } from "./DropZone";
import { PatientForm, PATIENT_FORM_ID } from "./PatientForm";
import { useSubmitPatientData } from "@/src/hooks/usePatientApi";

const STEPS = ["upload", "info"] as const;

const BTN =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

export function UploadStep() {
  const t = useTranslations("Patient");
  const status = usePatientStore((s) => s.status);
  const goToForm = usePatientStore((s) => s.goToForm);
  const backToUpload = usePatientStore((s) => s.backToUpload);
  const submitMutation = useSubmitPatientData();
  const submissionSuccessMsg = usePatientStore((s) => s.submissionSuccessMsg);
  const setSubmissionSuccess = usePatientStore((s) => s.setSubmissionSuccess);
  const [error, setError] = useState<string | null>(null);

  const step = status === Status.post ? 1 : 0;
  const isSubmitting = submitMutation.isPending;

  const handleSubmit = async (values: Record<string, string>) => {
    const { files } = usePatientStore.getState();
    setError(null);

    try {
      const res = await submitMutation.mutateAsync({ files, formValues: values });
      // Broadcast success to all tabs: clears files and resets to step 1
      setSubmissionSuccess(res?.message || "Gửi hồ sơ và hình ảnh thành công!", true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("actions.error");
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5 rounded-2xl bg-white/70 p-4 shadow-lg ring-1 ring-amber-900/10 backdrop-blur-md sm:p-6">
      <Stepper current={step} />

      {submissionSuccessMsg && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 font-medium animate-fadeIn">
          ✓ {submissionSuccessMsg}
        </div>
      )}

      {step === 0 ? <Dropzone /> : <PatientForm onSubmit={handleSubmit} />}

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
            className={`${BTN} border border-amber-900/20 bg-white text-amber-950 hover:bg-amber-50`}
          >
            {t("actions.back")}
          </button>
        )}

        <button
          type={step === 0 ? "button" : "submit"}
          form={PATIENT_FORM_ID}
          disabled={status === Status.empty || isSubmitting}
          onClick={step === 0 ? goToForm : undefined}
          className={`${BTN} bg-red-800 text-amber-50 shadow-sm hover:bg-red-900 disabled:bg-amber-900/15 disabled:text-amber-900/50 disabled:shadow-none`}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {step === 0 ? t("actions.next") : isSubmitting ? t("actions.submitting") : t("actions.submit")}
        </button>
      </div>
    </div>
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
          <li
            key={key}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 items-center gap-2.5 last:flex-none"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                done || active ? "bg-red-800 text-amber-50" : "bg-amber-900/10 text-amber-900/60"
              }`}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span className={`text-sm ${active ? "font-semibold text-red-900" : "text-amber-900/60"}`}>
              {t(key)}
            </span>
            {i < STEPS.length - 1 && (
              <span className={`h-px flex-1 transition-colors ${done ? "bg-red-800" : "bg-amber-900/20"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}