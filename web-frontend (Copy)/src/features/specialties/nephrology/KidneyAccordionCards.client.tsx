"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import {
  Activity,
  Layers,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface KidneyCardData {
  id: number;
  key: "ckd" | "stone" | "nephrotic" | "dialysis";
  gradient: string;
  badgeColor: string;
  icon: any;
}

const CARDS_CONFIG: KidneyCardData[] = [
  {
    id: 0,
    key: "ckd",
    gradient: "from-blue-200/40 via-cyan-100/30 to-teal-100/40",
    badgeColor: "bg-blue-500",
    icon: Activity,
  },
  {
    id: 1,
    key: "stone",
    gradient: "from-amber-200/40 via-orange-100/30 to-rose-100/40",
    badgeColor: "bg-amber-500",
    icon: Layers,
  },
  {
    id: 2,
    key: "nephrotic",
    gradient: "from-emerald-200/40 via-teal-100/30 to-cyan-100/40",
    badgeColor: "bg-emerald-500",
    icon: ShieldCheck,
  },
  {
    id: 3,
    key: "dialysis",
    gradient: "from-purple-200/50 via-indigo-100/40 to-cyan-200/40",
    badgeColor: "bg-purple-600",
    icon: Stethoscope,
  },
];

export function KidneyAccordionCards() {
  const t = useTranslations("Home.Kidney");
  const [activeId, setActiveId] = useState<number>(3);

  return (
    <div className="w-full max-w-6xl">
      <div className="flex md:hidden flex-col gap-4 w-full">
        {CARDS_CONFIG.map((card) => {
          return (
            <div
              key={`mobile-${card.id}`}
              className="rounded-3xl border border-stone-200 bg-white shadow-md p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-stone-900 tracking-tight">
                    {t(`cards.${card.key}.name`)}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[11px] font-bold text-stone-700">
                    <span className={`w-2 h-2 rounded-full ${card.badgeColor}`} />
                    {t(`cards.${card.key}.tag`)}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {t(`cards.${card.key}.fullDesc`)}
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-800">
                    <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <Activity className="w-3 h-3" />
                    </div>
                    <span>{t(`cards.${card.key}.feature1`)}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-800">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span>{t(`cards.${card.key}.feature2`)}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-800">
                    <div className="w-5 h-5 rounded-md bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-3 h-3" />
                    </div>
                    <span>{t(`cards.${card.key}.feature3`)}</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-2xl bg-linear-to-tr ${card.gradient} border border-white/80 space-y-2.5`}>
                <div className="bg-white/95 rounded-xl p-3 shadow-sm border border-stone-100 space-y-2">
                  <div className="text-xs text-stone-700 leading-relaxed font-medium">
                    {t(`cards.${card.key}.mockMessage`)}
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Tầm soát khuyến nghị
                    </span>
                    <Link
                      href={APP_ROUTES.SPECIALTIES.NEPHROLOGY}
                      className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-cyan-700"
                    >
                      <span>Khám ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:flex flex-row gap-3 sm:gap-4 items-stretch justify-center min-h-125">
        {CARDS_CONFIG.map((card) => {
          const isExpanded = activeId === card.id;
          const CardIcon = card.icon;

          return (
            <div
              key={`desktop-${card.id}`}
              onMouseEnter={() => setActiveId(card.id)}
              onClick={() => setActiveId(card.id)}
              className={`relative rounded-3xl border transition-[flex-grow,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer overflow-hidden flex flex-col justify-between ${
                isExpanded
                  ? "flex-[3.5] bg-white border-stone-200 shadow-xl ring-2 ring-stone-900/5 p-6 sm:p-8"
                  : "flex-1 bg-stone-50/90 hover:bg-white border-stone-200/70 shadow-sm p-5 sm:p-6"
              }`}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`font-black tracking-tight whitespace-nowrap ${
                      isExpanded
                        ? "text-2xl sm:text-3xl text-stone-900"
                        : "text-lg text-stone-800"
                    }`}
                  >
                    {t(`cards.${card.key}.name`)}
                  </h3>

                  {isExpanded && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[11px] font-bold text-stone-700 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${card.badgeColor}`} />
                      {t(`cards.${card.key}.tag`)}
                    </span>
                  )}
                </div>

                {!isExpanded ? (
                  <p className="text-xs text-stone-500 font-normal leading-relaxed line-clamp-2">
                    {t(`cards.${card.key}.shortDesc`)}
                  </p>
                ) : (
                  <div className="w-full min-w-70 space-y-4 pt-1">
                    <p className="text-sm text-stone-600 leading-relaxed font-normal">
                      {t(`cards.${card.key}.fullDesc`)}
                    </p>

                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-stone-800">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <span>{t(`cards.${card.key}.feature1`)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-stone-800">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span>{t(`cards.${card.key}.feature2`)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-stone-800">
                        <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-3.5 h-3.5" />
                        </div>
                        <span>{t(`cards.${card.key}.feature3`)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isExpanded ? (
                <div
                  className={`mt-6 p-4 sm:p-5 rounded-2xl bg-linear-to-tr ${card.gradient} relative overflow-hidden flex flex-col justify-end border border-white/80 shadow-inner w-full min-w-[280px]`}
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center text-red-500 font-black text-xs">
                      AI
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center text-blue-600 font-black text-xs">
                      MOH
                    </div>
                  </div>

                  <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-stone-100/90 space-y-3 z-10">
                    <div className="space-y-1.5 text-xs text-stone-600 border-b border-stone-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 font-medium">To:</span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-800 inline-flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-cyan-600" /> BS. Trưởng khoa Thận
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 font-medium">CC:</span>
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-800 inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" /> ai.nephro@chickenguy.health
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-700 leading-relaxed font-medium">
                      {t(`cards.${card.key}.mockMessage`)}
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Tầm soát khuyến nghị
                      </span>
                      <Link
                        href={APP_ROUTES.SPECIALTIES.NEPHROLOGY}
                        className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-cyan-700 transition-colors"
                      >
                        <span>Khám ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full mt-6 h-36 relative flex items-end justify-center overflow-hidden rounded-2xl">
                  <div
                    className={`absolute inset-0 bg-linear-to-t ${card.gradient} opacity-60 rounded-2xl`}
                  />
                  <div className="absolute bottom-3 text-stone-400">
                    <CardIcon className="w-5 h-5 opacity-40" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KidneyAccordionCards;
