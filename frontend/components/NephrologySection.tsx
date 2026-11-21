"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Activity,
  Layers,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface KidneyCardDef {
  key: "ckd" | "stone" | "nephrotic";
  badgeColor: string;
  gradient: string;
  icon: typeof Activity;
}

const CARDS_CONFIG: KidneyCardDef[] = [
  {
    key: "ckd",
    badgeColor: "bg-blue-500",
    gradient: "from-blue-100/60 via-cyan-50/50 to-teal-50/60",
    icon: Activity,
  },
  {
    key: "stone",
    badgeColor: "bg-amber-500",
    gradient: "from-amber-100/60 via-orange-50/50 to-rose-50/60",
    icon: Layers,
  },
  {
    key: "nephrotic",
    badgeColor: "bg-emerald-500",
    gradient: "from-emerald-100/60 via-teal-50/50 to-cyan-50/60",
    icon: ShieldCheck,
  },
];

export default function NephrologySection() {
  const t = useTranslations("Home.Kidney");
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      if (!cards.length) return;

      const mm = gsap.matchMedia();

      // Desktop: 3 cột sát nhau, khi scrolling đến thì lần lượt từng cột được đưa lên (stagger)
      mm.add("(min-width: 768px)", () => {
        gsap.from(cards, {
          y: 70,
          opacity: 0,
          duration: 0.85,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });

      // Mobile / modal view: rời rạc từng cột 1 lên khi scroll tới từng card
      mm.add("(max-width: 767px)", () => {
        cards.forEach((card) => {
          gsap.from(card, {
            y: 50,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="nephrology"
      className="w-full py-16 px-4 sm:px-[5%] lg:px-[8%] flex flex-col items-center"
    >
      <div className="w-full max-w-4xl text-center space-y-3 mb-12">
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

      {/* 3 cột sát nhau trải đều trên màn hình desktop */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 items-stretch">
        {CARDS_CONFIG.map((card, idx) => {
          const CardIcon = card.icon;

          return (
            <div
              key={card.key}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center shadow-xs">
                    <CardIcon className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[11px] font-bold text-stone-700">
                    <span className={`w-2 h-2 rounded-full ${card.badgeColor}`} />
                    {t(`cards.${card.key}.tag`)}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-stone-900 tracking-tight mb-2">
                    {t(`cards.${card.key}.name`)}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t(`cards.${card.key}.shortDesc`)}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-stone-100">
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

                <div className={`p-4 rounded-2xl bg-linear-to-tr ${card.gradient} border border-stone-200/60 space-y-2 mt-4`}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-600">
                    <Sparkles className="w-3 h-3 text-cyan-600" />
                    <span>AI Clinical Alert</span>
                  </div>
                  <p className="text-xs text-stone-700 font-medium leading-relaxed">
                    {t(`cards.${card.key}.mockMessage`)}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={APP_ROUTES.SPECIALTIES.NEPHROLOGY}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md"
                >
                  <span>{t(`cards.${card.key}.name`)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
