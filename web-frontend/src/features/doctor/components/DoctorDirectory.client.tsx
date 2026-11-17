"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Calendar, Star, CheckCircle2, Award, Stethoscope, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";

export interface DoctorItem {
  id: string;
  name: string;
  degree: string;
  specialty: "oncology" | "nephrology" | "cardiology";
  specialtyLabel: string;
  hospital: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  bio: string;
  availableDays: string[];
}

export const ALL_DOCTORS: DoctorItem[] = [
  {
    id: "doc-1",
    name: "Nguyễn Văn An",
    degree: "PGS.TS.BS",
    specialty: "oncology",
    specialtyLabel: "Ung bướu & Tai Mũi Họng",
    hospital: "Bệnh viện K Trung Ương",
    experienceYears: 25,
    rating: 4.9,
    reviewsCount: 312,
    bio: "Chuyên gia đầu ngành về nội soi phát hiện sớm tổn thương vòm họng, phẫu thuật và điều trị trúng đích các khối u vùng đầu - cổ.",
    availableDays: ["Thứ 2", "Thứ 4", "Thứ 6"],
  },
  {
    id: "doc-2",
    name: "Trần Bích Ngọc",
    degree: "BS.CKII",
    specialty: "nephrology",
    specialtyLabel: "Thận học & Lọc máu",
    hospital: "Bệnh viện Bạch Mai",
    experienceYears: 20,
    rating: 5.0,
    reviewsCount: 284,
    bio: "Hơn 20 năm kinh nghiệm điều trị suy thận mạn tiến triển, hội chứng thận hư kháng corticoid và chuẩn bị phẫu thuật ghép thận.",
    availableDays: ["Thứ 3", "Thứ 5", "Thứ 7"],
  },
  {
    id: "doc-3",
    name: "Lê Hoàng Long",
    degree: "TS.BS",
    specialty: "cardiology",
    specialtyLabel: "Tim mạch Can thiệp",
    hospital: "Bệnh viện Chợ Rẫy",
    experienceYears: 18,
    rating: 4.9,
    reviewsCount: 245,
    bio: "Chuyên gia can thiệp mạch vành, điều trị rối loạn nhịp tim phức tạp, suy tim mạn và ứng dụng phân tích sóng điện tim AI.",
    availableDays: ["Thứ 2", "Thứ 3", "Thứ 5"],
  },
  {
    id: "doc-4",
    name: "Phạm Quỳnh Chi",
    degree: "ThS.BS",
    specialty: "oncology",
    specialtyLabel: "Chẩn đoán Hình ảnh AI",
    hospital: "Bệnh viện Đại học Y Dược TP.HCM",
    experienceYears: 12,
    rating: 4.8,
    reviewsCount: 198,
    bio: "Nghiên cứu ứng dụng trí tuệ nhân tạo đối chiếu ảnh nội soi vòm họng và cắt lớp vi tính phân loại giai đoạn ung thư.",
    availableDays: ["Thứ 4", "Thứ 6", "Chủ nhật"],
  },
  {
    id: "doc-5",
    name: "Vũ Minh Tuấn",
    degree: "BS.CKI",
    specialty: "nephrology",
    specialtyLabel: "Thận - Tiết niệu & Tán sỏi",
    hospital: "Bệnh viện Hữu nghị Việt Đức",
    experienceYears: 15,
    rating: 4.9,
    reviewsCount: 176,
    bio: "Chuyên sâu tán sỏi thận qua da, phẫu thuật nội soi tiết niệu và bảo tồn chức năng lọc cầu thận.",
    availableDays: ["Thứ 2", "Thứ 4", "Thứ 7"],
  },
  {
    id: "doc-6",
    name: "Đặng Mai Phương",
    degree: "TS.BS",
    specialty: "cardiology",
    specialtyLabel: "Nội Tim Mạch & Tăng Huyết Áp",
    hospital: "Viện Tim Mạch Quốc Gia",
    experienceYears: 16,
    rating: 4.9,
    reviewsCount: 220,
    bio: "Tư vấn và điều trị tăng huyết áp kháng trị, bệnh cơ tim phì đại và theo dõi điện tâm đồ Holter liên tục.",
    availableDays: ["Thứ 3", "Thứ 5", "Thứ 6"],
  },
];

export function DoctorDirectory() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredDoctors = useMemo(() => {
    return ALL_DOCTORS.filter((doc) => {
      const matchFilter =
        activeFilter === "all" || doc.specialty === activeFilter;
      const matchSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialtyLabel.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [activeFilter, searchTerm]);

  return (
    <div className="w-full max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên bác sĩ, bệnh viện, chuyên khoa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Chuyên khoa:</span>
          </div>
          {[
            { id: "all", label: "Tất cả" },
            { id: "oncology", label: "Ung bướu" },
            { id: "nephrology", label: "Thận - Tiết niệu" },
            { id: "cardiology", label: "Tim mạch" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === tab.id
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-cyan-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {doc.name.split(" ").slice(-1)[0][0]}
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-cyan-700 uppercase tracking-wider">
                      {doc.degree}
                    </span>
                    <h3 className="font-extrabold text-lg text-stone-900 leading-snug">
                      {doc.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-xs font-bold text-amber-900">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{doc.rating}</span>
                </div>
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-stone-100 text-xs font-bold text-stone-800">
                {doc.specialtyLabel}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                {doc.bio}
              </p>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-stone-800">{doc.hospital}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Kinh nghiệm:</span>
                  <span className="font-semibold text-stone-800">{doc.experienceYears} năm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Lịch làm việc:</span>
                  <span className="font-semibold text-cyan-800">{doc.availableDays.join(", ")}</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href={APP_ROUTES.APPOINTMENTS}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Đặt Lịch Khám Ngay</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 text-stone-500 text-sm">
          Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm.
        </div>
      )}
    </div>
  );
}

export default DoctorDirectory;
