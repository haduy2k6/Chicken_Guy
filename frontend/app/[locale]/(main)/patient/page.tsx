import { UploadStep } from "@/components/UploadStep.client";
import RoleGate from "@/components/RoleGate.client";

export default function PatientPage() {
  return (
    <RoleGate role="patient"><main className="min-h-screen bg-linear-to-b from-[#FFFDFB] via-[#FFF7F2] to-[#FFF0E8] px-4 pb-16 pt-24 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-6 text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Cổng Tiếp Nhận & Sàng Lọc Bệnh Nhân
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Tải hình ảnh nội soi vòm họng và điền thông tin triệu chứng để nhận đánh giá hỗ trợ từ AI.
        </p>
      </div>

      <div className="w-full flex justify-center">
        <UploadStep />
      </div>
    </main></RoleGate>
  );
}
