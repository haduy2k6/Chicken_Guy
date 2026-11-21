"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, Loader2 } from "lucide-react";
import { usePublicDoctors } from "@/src/query/useScheduleQueries";
import { DoctorCard } from "./DoctorCard";

export function DoctorDirectory() {
  const t = useTranslations("DoctorDirectory");
  const { data: doctors = [], isLoading, error } = usePublicDoctors();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filters = useMemo(
    () => [
      { id: "all", label: t("all") },
      { id: "oncology", label: t("oncology") },
      { id: "nephrology", label: t("nephrology") },
      { id: "cardiology", label: t("cardiology") },
    ],
    [t]
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return doctors.filter((d) => {
      const inSpecialty = activeFilter === "all" || d.specialties.some((s) => s.code === activeFilter);
      const matches =
        !q ||
        d.name.toLowerCase().includes(q) ||
        (d.hospital ?? "").toLowerCase().includes(q) ||
        d.specialties.some((s) => s.name.toLowerCase().includes(q));
      return inSpecialty && matches;
    });
  }, [doctors, activeFilter, searchTerm]);

  return (
    <div className="w-full max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{t("specialtyFilter")}</span>
          </div>
          {filters.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id ? "bg-stone-900 text-white shadow-xs" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-cyan-600" />
        </div>
      ) : error ? (
        <div role="alert" className="text-center py-12 bg-white rounded-3xl border border-red-200 text-red-700 text-sm">
          {t("error")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => <DoctorCard key={doc.id} doc={doc} />)}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 text-stone-500 text-sm">
          {t("notFound")}
        </div>
      )}
    </div>
  );
}

export default DoctorDirectory;
