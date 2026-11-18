import { DoctorDirectory } from "@/components/DoctorDirectory.client";
import { Award, ShieldCheck, Stethoscope } from "lucide-react";

export default function DoctorsPage() {
  return (
    <main className="min-h-screen bg-stone-50/60 px-4 pb-20 pt-24 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-bold uppercase tracking-widest shadow-xs">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Hội Đồng Chuyên Môn Y Khoa</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          Đội Ngũ Bác Sĩ & Chuyên Gia Đầu Ngành
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Được đào tạo bài bản và công tác tại các bệnh viện tuyến đầu cả nước, đồng hành cùng mô hình AI để mang lại kết quả chẩn đoán chính xác và cá nhân hóa.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-stone-700">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Bác sĩ có chứng chỉ hành nghề chính thức
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <Stethoscope className="w-4 h-4 text-cyan-600" /> Đa chuyên khoa: Ung bướu, Thận, Tim mạch
          </span>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <DoctorDirectory />
      </div>
    </main>
  );
}
