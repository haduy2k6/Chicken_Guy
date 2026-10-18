"use client";

import { useTranslations } from "next-intl";

// value: giá trị gửi lên server (khớp dataset) | key: khóa dịch trong "Patient.form.options"
type Option = { value: string; key: string };

const YES_NO: Option[] = [
  { value: "Yes", key: "yes" },
  { value: "No", key: "no" },
];

// name: tên cột dataset (gửi lên server) | key: khóa dịch trong "Patient.form.fields"
type Field =
  | { name: string; key: string; type: "number" }
  | { name: string; key: string; type: "choice"; options: Option[] };

const yn = (name: string, key: string): Field => ({ name, key, type: "choice", options: YES_NO });

const SECTIONS: { key: string; fields: Field[] }[] = [
  {
    key: "general",
    fields: [
      { name: "Age", key: "age", type: "number" },
      {
        name: "Gender",
        key: "gender",
        type: "choice",
        options: [
          { value: "Male", key: "male" },
          { value: "Female", key: "female" },
        ],
      },
    ],
  },
  {
    key: "risk",
    fields: [
      yn("Tobacco Use", "tobacco"),
      yn("Alcohol Consumption", "alcohol"),
      yn("Betel Quid Use", "betelQuid"),
      yn("HPV Infection", "hpv"),
      yn("Chronic Sun Exposure", "sunExposure"),
      yn("Poor Oral Hygiene", "oralHygiene"),
      yn("Family History of Cancer", "familyHistory"),
      yn("Compromised Immune System", "immune"),
      {
        name: "Diet (Fruits & Vegetables Intake)",
        key: "diet",
        type: "choice",
        options: [
          { value: "Low", key: "low" },
          { value: "Moderate", key: "moderate" },
          { value: "High", key: "high" },
        ],
      },
    ],
  },
  {
    key: "symptoms",
    fields: [
      yn("Oral Lesions", "lesions"),
      yn("Unexplained Bleeding", "bleeding"),
      yn("Difficulty Swallowing", "swallowing"),
      yn("White or Red Patches in Mouth", "patches"),
    ],
  },
];

export const PATIENT_FORM_ID = "patient-form";

export function PatientForm({ onSubmit }: { onSubmit: (values: Record<string, string>) => void }) {
  const t = useTranslations("Patient.form");

  return (
    <form
      id={PATIENT_FORM_ID}
      className="flex w-full flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
      }}
    >
      {SECTIONS.map(({ key, fields }) => (
        <fieldset key={key} className="rounded-xl bg-amber-50 px-4 pb-4 pt-2 ring-1 ring-amber-900/10">
          <legend className="px-2 text-sm font-semibold text-red-900">{t(`sections.${key}`)}</legend>

          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            {fields.map((f) =>
              f.type === "number" ? (
                <label key={f.name} className="flex flex-col gap-1.5 text-sm text-amber-950">
                  {t(`fields.${f.key}`)}
                  <input
                    name={f.name}
                    type="number"
                    inputMode="numeric"
                    min={10}
                    max={80}
                    required
                    autoComplete="off"
                    placeholder={t("agePlaceholder")}
                    className="rounded-lg border border-amber-700/40 bg-white px-3 py-2 outline-none transition placeholder:text-amber-900/40 focus:border-red-800 focus:ring-2 focus:ring-red-800/30"
                  />
                </label>
              ) : (
                <div
                  key={f.name}
                  role="radiogroup"
                  aria-label={t(`fields.${f.key}`)}
                  className="flex flex-col gap-1.5 text-sm text-amber-950"
                >
                  <span>{t(`fields.${f.key}`)}</span>
                  <div className="mt-auto flex divide-x divide-amber-700/30 overflow-hidden rounded-lg border border-amber-700/40 bg-white">
                    {f.options.map((o) => (
                      <label key={o.value} className="flex-1 cursor-pointer">
                        <input type="radio" name={f.name} value={o.value} required className="peer sr-only" />
                        <span className="block px-3 py-2 text-center transition-colors hover:bg-orange-100 peer-checked:bg-red-800 peer-checked:font-medium peer-checked:text-amber-50 peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-red-800">
                          {t(`options.${o.key}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </fieldset>
      ))}
    </form>
  );
}