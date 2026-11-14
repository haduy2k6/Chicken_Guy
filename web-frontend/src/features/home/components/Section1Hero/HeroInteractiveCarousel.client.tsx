"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import {
  Hourglass,
  Sparkles,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

interface FeatureConfig {
  id: number;
  key: "speed" | "assistant" | "records" | "security";
  icon: any;
  badgeTag: string;
}

const FEATURES_LIST: FeatureConfig[] = [
  { id: 0, key: "speed", icon: Hourglass, badgeTag: "Tốc độ" },
  { id: 1, key: "assistant", icon: Sparkles, badgeTag: "Beta" },
  { id: 2, key: "records", icon: FileText, badgeTag: "Hồ sơ" },
  { id: 3, key: "security", icon: CreditCard, badgeTag: "Bảo mật" },
];

export function HeroInteractiveCarousel() {
  const t = useTranslations("Home.HeroSection1");
  const [activeIndex, setActiveIndex] = useState<number>(1);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? FEATURES_LIST.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === FEATURES_LIST.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === FEATURES_LIST.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const currentFeature = FEATURES_LIST[activeIndex];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative z-10 mt-12 mb-4 flex items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous feature"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {FEATURES_LIST.map((item) => {
            const isActive = activeIndex === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(item.id)}
                aria-label={`Select feature ${item.id + 1}`}
                className={`transition-all duration-300 flex items-center justify-center cursor-pointer w-12 h-12 rounded-full ${
                  isActive
                    ? "bg-white text-emerald-600 shadow-xl ring-4 ring-emerald-300/40 font-bold"
                    : "bg-white/20 hover:bg-white/30 backdrop-blur-md text-white/90"
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next feature"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-4xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-white/80 flex flex-col md:flex-row items-center gap-8 text-stone-900 mt-2 justify-stretch">
        <div className="flex-1 w-full space-y-4 min-h-50 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t(`features.${currentFeature.key}.badge`)}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-semibold">
                {currentFeature.badgeTag}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">
              {t(`features.${currentFeature.key}.title`)}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {t(`features.${currentFeature.key}.desc`)}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={APP_ROUTES.PATIENT.ROOT}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-900 hover:text-emerald-600 transition-colors group"
            >
              <span>{t(`features.${currentFeature.key}.learnMore`)}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <div className="w-full bg-[#edf7ea] rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden flex items-center justify-center min-h-55">
            <div className="absolute inset-0 flex items-center justify-center gap-1 sm:gap-1.5 opacity-20 pointer-events-none">
              {[40, 65, 85, 45, 95, 75, 55, 90, 60, 40, 80, 50, 70, 95, 45, 60].map(
                (h, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${h}%` }}
                    className="w-1 sm:w-1.5 bg-emerald-600 rounded-full"
                  />
                )
              )}
            </div>
            <div className="relative z-10 w-full max-w-70 bg-white rounded-xl p-4 shadow-xl border border-stone-100/90 flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-cyan-500 to-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  DM
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {t(`features.${currentFeature.key}.mockName`)}
                  </h4>
                  <p className="text-[10px] text-stone-500 truncate">
                    {t(`features.${currentFeature.key}.mockRole`)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center gap-1 text-[11px] text-stone-400">
                <span className="w-0.5 h-4 bg-stone-700 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroInteractiveCarousel;