import { useTranslations } from "next-intl";
import { Heart, Activity, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";

export default function CardiologySection() {
  const t = useTranslations("Home.Cardiology");

  const blocks = [
    {
      key: "cad",
      icon: Zap,
      iconBg: "bg-rose-50 text-rose-600",
      borderCls: "border-rose-100 hover:border-rose-300",
      btnCls: "text-rose-600 hover:text-rose-700",
    },
    {
      key: "arrhythmia",
      icon: Activity,
      iconBg: "bg-cyan-50 text-cyan-600",
      borderCls: "border-cyan-100 hover:border-cyan-300",
      btnCls: "text-cyan-600 hover:text-cyan-700",
    },
    {
      key: "hypertension",
      icon: ShieldCheck,
      iconBg: "bg-amber-50 text-amber-600",
      borderCls: "border-amber-100 hover:border-amber-300",
      btnCls: "text-amber-600 hover:text-amber-700",
    },
  ] as const;

  return (
    <section
      id="cardiology"
      className="w-full py-16 px-4 sm:px-[5%] lg:px-[8%] flex flex-col items-center bg-linear-to-b from-white via-rose-50/25 to-white"
    >
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

      {/* Các khối sát nhau trên dưới */}
      <div className="w-full max-w-4xl flex flex-col gap-4 sm:gap-5">
        {blocks.map((block) => {
          const BlockIcon = block.icon;
          return (
            <div
              key={block.key}
              className={`rounded-3xl border ${block.borderCls} bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5`}
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <div
                  className={`w-13 h-13 rounded-2xl ${block.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
                >
                  <BlockIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                    {t(`features.${block.key}.title`)}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
                    {t(`features.${block.key}.desc`)}
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end md:self-center">
                <Link
                  href={APP_ROUTES.SPECIALTIES.CARDIOLOGY}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 ${block.btnCls} transition-colors border border-stone-200/70`}
                >
                  <span>{t("ctaButton")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
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
