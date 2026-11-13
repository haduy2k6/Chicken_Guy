import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { KidneyAccordionCards } from "./KidneyAccordionCards.client";

export default function NephrologySection() {
  const t = useTranslations("Home.Kidney");

  return (
    <section id="nephrology" className="w-full py-16 px-3 sm:px-[5%] lg:px-[8%] flex flex-col items-center">
      <div className="w-full max-w-4xl text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100/80 border border-cyan-200 text-cyan-900 text-xs font-extrabold uppercase tracking-widest shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>{t("badge")}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          {t("title")}
        </h2>

        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>
      </div>
      <KidneyAccordionCards />
    </section>
  );
}
