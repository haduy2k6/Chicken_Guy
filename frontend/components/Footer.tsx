import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import { ShieldCheck, Stethoscope, PhoneCall, MapPin } from "lucide-react";

const linkCls = "hover:text-white transition-colors";

export default function Footer() {
  const t = useTranslations("Home.Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#18181B] text-stone-300 pt-16 pb-12 px-4 sm:px-[6%] lg:px-[8%] border-t border-stone-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Image src="/chicken_Guy.svg" alt={t("brand.logoAlt")} width={160} height={45} className="h-9 w-auto brightness-200" />
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-bold border border-cyan-800/80">
              {t("brand.badge")}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-stone-400 font-normal">{t("brand.mission")}</p>
          <div className="flex flex-col gap-2 pt-2 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t("brand.security")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>{t("brand.withDoctors")}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t("patient.title")}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href={APP_ROUTES.SPECIALTIES.ONCOLOGY} className={linkCls}>{t("patient.sendImage")}</Link></li>
            <li><Link href={APP_ROUTES.SPECIALTIES.ONCOLOGY} className={linkCls}>{t("patient.warningSigns")}</Link></li>
            <li><Link href={APP_ROUTES.APPOINTMENTS} className={linkCls}>{t("patient.schedule")}</Link></li>
            <li className="text-stone-400">{t("patient.anonymity")}</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t("doctor.title")}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href={APP_ROUTES.DOCTORS} className={linkCls}>{t("doctor.team")}</Link></li>
            {/* Lịch trực và ca bệnh nằm ở bàn làm việc bác sĩ; /appointments chỉ dành cho bệnh nhân */}
            <li><Link href={APP_ROUTES.DOCTOR} className={linkCls}>{t("doctor.shifts")}</Link></li>
            <li><Link href={APP_ROUTES.SPECIALTIES.NEPHROLOGY} className={linkCls}>{t("doctor.nephrology")}</Link></li>
            <li><Link href={APP_ROUTES.SPECIALTIES.CARDIOLOGY} className={linkCls}>{t("doctor.cardiology")}</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t("support.title")}</h4>
          <div className="space-y-2 text-xs text-stone-400">
            <p className="font-semibold text-white">{t("support.hotlineLabel")}</p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <PhoneCall className="w-4 h-4" />
              <span>1800 6868 (Toll-Free)</span>
            </div>
            <p>{t("support.hours")}</p>
            <div className="flex items-center gap-2 pt-1">
              <MapPin className="w-4 h-4 text-stone-500" />
              <span>{t("support.location")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Chuỗi dịch do dự án kiểm soát; không đưa nội dung từ bên ngoài vào disclaimer */}
        <p className="text-[11px] text-stone-500 max-w-2xl leading-relaxed" dangerouslySetInnerHTML={{ __html: t.raw("disclaimer") }} />
        <p className="text-xs text-stone-500 flex items-center justify-center gap-1 shrink-0">
          <span>{t("copyright", { year })}</span>
        </p>
      </div>
    </footer>
  );
}
