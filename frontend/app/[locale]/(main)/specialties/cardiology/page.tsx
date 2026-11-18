import { Heart, Activity, ShieldCheck, Zap } from "lucide-react";

export default function CardiologySpecialtyPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#FFF5F5] via-[#FFF8F8] to-[#FFFFFF] px-4 pb-20 pt-24 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-900 text-xs font-extrabold uppercase tracking-widest shadow-xs">
          <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
          <span>Chuyên khoa Tim Mạch & Huyết Học</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          Tầm Soát Nguy Cơ Tim Mạch & Phân Tích Sóng Điện Tim
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Ứng dụng học sâu đánh giá nguy cơ nhồi máu cơ tim, xơ vữa động mạch vành và rối loạn nhịp tim qua mô hình tính điểm nguy cơ đa biến kết hợp phân tích điện tâm đồ (ECG).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-stone-700">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <Zap className="w-4 h-4 text-amber-500" /> Nhận diện sớm cơn thiếu máu cơ tim
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <Activity className="w-4 h-4 text-cyan-600" /> Quét sóng P-QRS-T tìm rung nhĩ
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Phòng ngừa nguy cơ đột quỵ não
          </span>
        </div>
      </div>

      <div role="status" className="w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-950">
        Biểu mẫu tiếp nhận và quy trình phân tích tim mạch chưa được cấu hình. Hiện hệ thống chưa nhận hồ sơ chuyên khoa này.
      </div>
    </main>
  );
}
