import { NephrologyIntakeForm } from "@/components/NephrologyIntakeForm.client";
import { Sparkles, Activity, ShieldCheck, Stethoscope } from "lucide-react";

export default function NephrologySpecialtyPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#F0FDF4] via-[#F8FAFC] to-[#F0FDFA] px-4 pb-20 pt-24 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-900 text-xs font-extrabold uppercase tracking-widest shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>Chuyên khoa Thận - Tiết Niệu</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          Tầm Soát Bệnh Thận Mạn & Đánh Giá eGFR Toàn Diện
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Đo lường chức năng lọc cầu thận, phát hiện sớm suy thận mạn tính (CKD), sỏi tiết niệu và hội chứng thận hư từ các chỉ số xét nghiệm sinh hóa máu và nước tiểu.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-stone-700">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <Activity className="w-4 h-4 text-cyan-600" /> Chuẩn hóa công thức CKD-EPI 2021
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Phân tầng 5 giai đoạn suy thận
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <Stethoscope className="w-4 h-4 text-purple-600" /> Hướng dẫn dinh dưỡng bảo vệ thận
          </span>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <NephrologyIntakeForm />
      </div>
    </main>
  );
}
