import { useTranslations } from "next-intl";
import { Award, Calendar, CheckCircle2, Star, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";

export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  hospital: string;
  experience: string;
  rating: number;
  consultations: string;
  color: string;
}

export const FEATURED_DOCTORS: DoctorProfile[] = [
  {
    id: "doc-1",
    name: "PGS.TS.BS Nguyễn Văn An",
    title: "Chuyên gia Ung Bướu & Tai Mũi Họng",
    specialty: "Ung bướu & Vòm họng",
    hospital: "Bệnh viện K Trung Ương",
    experience: "25+ năm",
    rating: 4.9,
    consultations: "3.200+",
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "doc-2",
    name: "BS.CKII Trần Bích Ngọc",
    title: "Trưởng khoa Thận - Tiết Niệu",
    specialty: "Thận học & Lọc máu",
    hospital: "Bệnh viện Bạch Mai",
    experience: "20+ năm",
    rating: 5.0,
    consultations: "2.800+",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "doc-3",
    name: "TS.BS Lê Hoàng Long",
    title: "Phó Trưởng khoa Tim Mạch Can Thiệp",
    specialty: "Tim mạch & Điện sinh lý tim",
    hospital: "Bệnh viện Chợ Rẫy",
    experience: "18+ năm",
    rating: 4.9,
    consultations: "2.400+",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "doc-4",
    name: "ThS.BS Phạm Quỳnh Chi",
    title: "Chuyên gia Chẩn đoán Hình ảnh AI",
    specialty: "Chẩn đoán hình ảnh & AI Y tế",
    hospital: "Bệnh viện Đại học Y Dược",
    experience: "12+ năm",
    rating: 4.8,
    consultations: "1.900+",
    color: "from-emerald-500 to-teal-600",
  },
];

export default function DoctorBoardSection() {
  const t = useTranslations("Home.Doctor.Section4");

  return (
    <section id="doctors" className="w-full py-16 px-4 sm:px-[5%] lg:px-[8%] flex flex-col items-center bg-stone-50/70 border-t border-stone-200/60">
      <div className="w-full max-w-4xl text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-bold uppercase tracking-widest shadow-xs">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>{t("actionTitle")}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          {t("title.present")}
        </h2>

        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          {t("value.present")}
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURED_DOCTORS.map((doc) => (
          <div
            key={doc.id}
            className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${doc.color} flex items-center justify-center text-white font-extrabold text-xl shadow-md`}>
                  {doc.name.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-900">{doc.rating}</span>
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-stone-900 group-hover:text-cyan-700 transition-colors">
                  {doc.name}
                </h3>
                <p className="text-xs font-semibold text-stone-500 pt-0.5">
                  {doc.title}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-stone-800">{doc.hospital}</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Kinh nghiệm:</span>
                  <span className="font-semibold text-stone-800">{doc.experience}</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Đã hội chẩn:</span>
                  <span className="font-semibold text-stone-800">{doc.consultations} ca</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href={APP_ROUTES.APPOINTMENTS}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Đặt lịch khám</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center">
        <Link
          href={APP_ROUTES.DOCTORS}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-stone-300 hover:border-stone-900 text-stone-900 font-bold text-xs sm:text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
        >
          <span>Xem tất cả danh sách bác sĩ chuyên khoa</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
