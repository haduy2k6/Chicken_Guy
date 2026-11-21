"use client";

import { useTranslations } from "next-intl";
import { Award, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import { usePublicDoctors } from "@/src/query/useScheduleQueries";
import { DoctorCard } from "./DoctorCard";

const FEATURED_COUNT = 4;

export default function DoctorBoardSection() {
  const t = useTranslations("Home.Doctor.Section4");
  const { data: doctors = [] } = usePublicDoctors();
  const featured = doctors.slice(0, FEATURED_COUNT);

  return (
    <section id="doctors" className="w-full py-16 px-4 sm:px-[5%] lg:px-[8%] flex flex-col items-center bg-stone-50/70 border-t border-stone-200/60">
      <div className="w-full max-w-4xl text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-bold uppercase tracking-widest shadow-xs">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>{t("actionTitle")}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">{t("title.present")}</h2>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">{t("value.present")}</p>
      </div>

      {featured.length > 0 && (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((doc) => <DoctorCard key={doc.id} doc={doc} />)}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center">
        <Link
          href={APP_ROUTES.DOCTORS}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-stone-300 hover:border-stone-900 text-stone-900 font-bold text-xs sm:text-sm shadow-sm transition-all hover:shadow-md"
        >
          <span>{t("viewAll")}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
