import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default function OncologySection() {
  const t = useTranslations("Home.Oncology");

  return (
    <section
      id="oncology"
      className="relative w-full py-16 px-4 sm:px-[6%] lg:px-[10%] flex flex-col lg:flex-row items-center justify-between gap-10 overflow-hidden rounded-3xl shadow-sm"
    >
      <article className="flex-1 max-w-2xl flex flex-col items-start gap-5 z-10 border-2 border-amber-100 p-6 rounded-3xl bg-white/40">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold tracking-wide uppercase">
          <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
          <span>{t("badge")}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 leading-tight tracking-tight">
          {t("title")}
        </h2>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
          {t("whoReport")}
        </p>

        <p className="text-sm sm:text-base text-stone-700/90 leading-relaxed font-medium bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-orange-200/60 shadow-xs">
          {t("partnership")}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href={APP_ROUTES.SPECIALTIES.ONCOLOGY}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-linear-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span>{t("ctaButton")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("aiReady")}</span>
          </div>
        </div>
      </article>

      <div className="flex-1 w-full max-w-lg lg:max-w-md relative aspect-square flex items-center justify-center">
        <Image 
          src="/patientS1.svg"
          width={350}
          height={250}
          alt="Patient Screening"
        />
      </div>
    </section>
  );
}
