import { UploadStep } from "@/src/features/patient/components/UploadStep.client";
import { ShieldAlert, Microscope, Activity, CheckCircle2 } from "lucide-react";

export default function OncologySpecialtyPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#FFFDFB] via-[#FFF7F2] to-[#FFF0E8] px-4 pb-20 pt-24 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-900 text-xs font-extrabold uppercase tracking-widest shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Chuyên khoa Ung Bướu & Tai Mũi Họng</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          Tầm Soát & Phát Hiện Sớm Ung Thư Vòm Họng (NPC)
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Ứng dụng mô hình AI thị giác máy tính quét tự động ảnh nội soi vòm họng độ phân giải cao kết hợp điều tra dịch tễ học và tiền sử Epstein-Barr Virus (EBV).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-stone-700">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <Microscope className="w-4 h-4 text-rose-600" /> Phân tích đa vùng niêm mạc
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <Activity className="w-4 h-4 text-cyan-600" /> Phân tầng giai đoạn TNM (AJCC-8)
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bác sĩ chuyên khoa duyệt kết quả
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <div className="bg-rose-900 text-white p-4 rounded-t-2xl font-bold text-sm flex items-center justify-between">
          <span>Khu Vực Khám & Tiếp Nhận Ảnh Soi Vòm Họng</span>
          <span className="text-[11px] font-normal opacity-80">Bước 1: Tải ảnh • Bước 2: Khảo sát</span>
        </div>
        <UploadStep />
      </div>
    </main>
  );
}
