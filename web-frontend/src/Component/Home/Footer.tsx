"use client";

import Image from "next/image";
import { Link } from "@/src/i18n/routing";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  PhoneCall,
  Mail,
  MapPin,
  Sparkles,
  Stethoscope,
  UserCheck,
} from "lucide-react";

export default function Footer() {
  const t = useTranslations("Home.Footer");

  return (
    <footer className="w-full relative bg-linear-to-r from-[#FF9E7D] via-[#FF8364] to-[#FF7052] text-white overflow-hidden pt-14 pb-8 border-t border-white/20">

      {/* Decorative Wave & Glow Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-white/20">

          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-md">
                <Image
                  src="/chicken_Guy.svg"
                  alt={t("brand.logoAlt")}
                  width={140}
                  height={50}
                  className="object-contain h-8 w-auto brightness-0 invert"
                />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full bg-white/20 border border-white/30">
                {t("brand.badge")}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-md">
              {t("brand.mission")}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white/95">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                {t("brand.security")}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white/95">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                {t("brand.withDoctors")}
              </span>
            </div>
          </div>

          {/* Column 2: Patients */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-200" />
              {t("patient.title")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/80">
              <li>
                <Link href="/patient" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>→</span> {t("patient.sendImage")}
                </Link>
              </li>
              <li>
                <Link href="/patient" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>→</span> {t("patient.warningSigns")}
                </Link>
              </li>
              <li>
                <span className="opacity-80">→ {t("patient.photoGuide")}</span>
              </li>
              <li>
                <span className="opacity-80">→ {t("patient.anonymity")}</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Doctors */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-200" />
              {t("doctor.title")}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/80">
              <li>
                <Link href="/doctor" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>→</span> {t("doctor.caseIntake")}
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>→</span> {t("doctor.aiCompare")}
                </Link>
              </li>
              <li>
                <span className="opacity-80">→ {t("doctor.tnm")}</span>
              </li>
              <li>
                <span className="opacity-80">→ {t("doctor.consult")}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-200" />
              {t("support.title")}
            </h4>
            <div className="space-y-2 text-xs text-white/90">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
                <span className="text-[10px] uppercase font-bold text-white/70 block">
                  {t("support.hotlineLabel")}
                </span>
                <span className="text-base font-extrabold text-white font-mono">1800 6868</span>
                <span className="text-[10px] text-white/70 block">{t("support.hours")}</span>
              </div>
              <p className="flex items-center gap-2 text-white/80">
                <Mail className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span>hotro.npc@chickenguy.ai</span>
              </p>
              <p className="flex items-center gap-2 text-white/80">
                <MapPin className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                <span>{t("support.location")}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/75">
          <p className="max-w-2xl text-center md:text-left text-[11px] leading-relaxed italic">
            *{" "}
            {t.rich("disclaimer", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>

          <p className="text-center md:text-right font-medium text-[11px] whitespace-nowrap">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>

      </div>
    </footer>
  );
}