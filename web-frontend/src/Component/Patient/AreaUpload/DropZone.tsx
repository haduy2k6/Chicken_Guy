"use client";

import { useEffect, useRef, useState } from "react";
import { CloudBackup, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { usePatientStore } from "@/src/Store/usePatientStore";
import { patientTheme } from "@/src/Store/usePatientTheme";
import { userAuth } from "@/src/Store/useAuthStore";

const MAX_MB = 4;
const MAX_SIZE = MAX_MB * 1024 * 1024;

export function Dropzone() {
  const t = useTranslations("Patient.dropzone");
  const user = userAuth((s) => s.user);
  const userId = user?.userId || "guest";
  const files = usePatientStore((s) => s.files);
  const addFiles = usePatientStore((s) => s.addFiles);
  const removeFile = usePatientStore((s) => s.removeFile);
  const clearFiles = usePatientStore((s) => s.clearFiles);
  const loadFilesFromDb = usePatientStore((s) => s.loadFilesFromDb);
  const dragging = patientTheme((s) => s.dragging);
  const setDragging = patientTheme((s) => s.setDragging);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFilesFromDb(userId);
  }, [loadFilesFromDb, userId]);

  const handleFiles = (list: FileList) => {
    const valid: File[] = [];
    const rejected: string[] = [];

    Array.from(list).forEach((file) => {
      if (!file.type.startsWith("image/")) rejected.push(t("notImage", { name: file.name }));
      else if (file.size > MAX_SIZE) rejected.push(t("tooLarge", { name: file.name, max: MAX_MB }));
      else valid.push(file);
    });

    setErrors(rejected);
    if (valid.length) addFiles(valid);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        aria-label={t("ariaLabel")}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 ${
          dragging
            ? "border-red-800 bg-amber-200"
            : "border-amber-700/50 bg-amber-50 hover:border-amber-700 hover:bg-orange-100"
        }`}
      >
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            dragging ? "bg-red-800 text-amber-50" : "bg-orange-200 text-red-800"
          }`}
        >
          <CloudBackup size={24} />
        </span>
        <span className="font-medium text-amber-950">
          {dragging ? t("titleDragging") : t("title")}
        </span>
        <span className="text-sm text-amber-900/70">{t("hint")}</span>
        <span className="text-xs text-amber-900/60">{t("limit", { max: MAX_MB })}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {errors.length > 0 && (
        <ul
          role="alert"
          className="flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-amber-950">{t("selected", { count: files.length })}</p>
            <button
              type="button"
              onClick={clearFiles}
              className="rounded text-sm text-red-800 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800"
            >
              {t("clearAll")}
            </button>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {files.map((file, i) => (
              <FileItem
                key={`${file.name}-${file.lastModified}-${i}`}
                file={file}
                onRemove={() => removeFile(i)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FileItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  const t = useTranslations("Patient.dropzone");
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <li className="relative overflow-hidden rounded-lg bg-amber-100 ring-1 ring-amber-900/10">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="aspect-square w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("remove", { name: file.name })}
        className="absolute right-1.5 top-1.5 rounded-full bg-red-800/90 p-1 text-amber-50 shadow transition-colors hover:bg-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X size={14} />
      </button>
    </li>
  );
}