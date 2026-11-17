import { useTranslations } from "next-intl";
import { Heart, Activity, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";

export default function CardiologySection() {
  const t = useTranslations("Home.Cardiology");

  return (
    <section id="cardiology" className="w-full py-16 px-4 sm:px-[5%] lg:px-[8%] flex flex-col items-center bg-linear-to-b from-white via-rose-50/30 to-white">
      <div className="w-full max-w-4xl text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-900 text-xs font-extrabold uppercase tracking-widest shadow-xs">
          <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
          <span>{t("badge")}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          {t("title")}
        </h2>

        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">
              {t("features.cad.title")}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t("features.cad.desc")}
            </p>
          </div>
          <div className="pt-6">
            <Link
              href={APP_ROUTES.SPECIALTIES.CARDIOLOGY}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              <span>{t("ctaButton")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">
              {t("features.arrhythmia.title")}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t("features.arrhythmia.desc")}
            </p>
          </div>
          <div className="pt-6">
            <Link
              href={APP_ROUTES.SPECIALTIES.CARDIOLOGY}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700"
            >
              <span>{t("ctaButton")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">
              {t("features.hypertension.title")}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t("features.hypertension.desc")}
            </p>
          </div>
          <div className="pt-6">
            <Link
              href={APP_ROUTES.SPECIALTIES.CARDIOLOGY}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              <span>{t("ctaButton")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-6 border-t border-rose-100 text-xs font-bold text-stone-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>{t("stats.cases")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          <span>{t("stats.speed")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>{t("stats.verified")}</span>
        </div>
      </div>
    </section>
  );
}
