import { useTranslations } from "next-intl";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import type { PublicDoctor } from "@/src/features/schedule/schedule.service";

/** Thẻ bác sĩ dùng chung cho trang danh sách và mục "Đội ngũ" ở trang chủ (dữ liệu thật từ API) */
export function DoctorCard({ doc }: { doc: PublicDoctor }) {
  const t = useTranslations("Home.Doctor.Section4");
  return (
    <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-cyan-900 text-white font-black text-lg flex items-center justify-center shadow-md">
            {doc.name.trim().split(" ").slice(-1)[0]?.[0] ?? "B"}
          </div>
          <div>
            {doc.degree && <span className="text-[11px] font-extrabold text-cyan-700 uppercase tracking-wider">{doc.degree}</span>}
            <h3 className="font-extrabold text-lg text-stone-900 leading-snug">{doc.name}</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {doc.specialties.map((s) => (
            <span key={s.code} className="px-3 py-1 rounded-full bg-stone-100 text-xs font-bold text-stone-800">{s.name}</span>
          ))}
        </div>

        {doc.bio && <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">{doc.bio}</p>}

        <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
          {doc.hospital && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium text-stone-800">{doc.hospital}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-stone-500">{t("experience")}</span>
            <span className="font-semibold text-stone-800">{t("years", { count: doc.experienceYears })}</span>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Link
          href={APP_ROUTES.APPOINTMENTS}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t("bookAppointment")}</span>
        </Link>
      </div>
    </div>
  );
}

export default DoctorCard;
