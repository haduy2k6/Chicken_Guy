import { ShieldCheck, Heart, Award, Sparkles, Stethoscope } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-stone-50/60 px-4 pb-20 pt-24 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center space-y-3 mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-bold uppercase tracking-widest shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Về Dự Án Y Tế Số Chicken Guy Health AI</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
          Ứng Dụng Trí Tuệ Nhân Tạo Vì Sức Khỏe Cộng Đồng
        </h1>

        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Nền tảng công nghệ y tế tiên phong kết hợp mô hình AI thị giác máy tính và học sâu hỗ trợ tầm soát sớm ung thư vòm họng, bệnh lý thận mạn tính và tim mạch.
        </p>
      </div>

      <div className="w-full max-w-5xl space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Sứ Mệnh Nhân Văn</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Rút ngắn thời gian tiếp cận chẩn đoán sơ bộ cho người dân vùng xa, giảm tải cho bệnh viện tuyến trên và nâng cao tỷ lệ phát hiện sớm bệnh lý ác tính ở giai đoạn có thể chữa khỏi.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Bảo Mật Y Tế Tuyệt Đối</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Dữ liệu y tế và hình ảnh nội soi được mã hóa 2 chiều AES-256, phân vùng cô lập theo danh tính người dùng và tuân thủ các quy định bảo mật thông tin y tế nghiêm ngặt.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Bác Sĩ Là Trung Tâm</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              AI chỉ đóng vai trò trợ lý sàng lọc và cảnh báo sớm. Mọi phác đồ can thiệp, kê đơn và chỉ định lâm sàng bắt buộc phải được bác sĩ chuyên khoa phê duyệt trực tiếp.
            </p>
          </div>
        </div>

        <div className="bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-8 sm:p-12 text-white space-y-6 shadow-xl">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-amber-300">
              <Award className="w-3.5 h-3.5" />
              <span>Tiêu Chuẩn Khoa Học Y Sinh</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quy Trình Sàng Lọc & Kiểm Thẩm Khép Kín 4 Bước
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Đảm bảo sự an toàn và độ tin cậy y khoa cao nhất cho người bệnh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {[
              {
                step: "01",
                title: "Tiếp nhận hồ sơ",
                desc: "Bệnh nhân tải ảnh nội soi hoặc nhập các chỉ số sinh hóa máu / nước tiểu.",
              },
              {
                step: "02",
                title: "AI phân tích sơ bộ",
                desc: "Mô hình xử lý trong 2-3 giây, nhận diện tổn thương và tính toán nguy cơ.",
              },
              {
                step: "03",
                title: "Bác sĩ hội chẩn",
                desc: "Hội đồng bác sĩ chuyên khoa kiểm tra chéo và ký xác nhận lâm sàng.",
              },
              {
                step: "04",
                title: "Tư vấn & Lộ trình",
                desc: "Bệnh nhân nhận kết quả kèm lời khuyên dinh dưỡng và hẹn khám chuyên sâu.",
              },
            ].map((st) => (
              <div key={st.step} className="bg-white/10 backdrop-blur-xs rounded-2xl p-5 border border-white/10 space-y-2">
                <div className="text-2xl font-black text-amber-400">{st.step}</div>
                <h4 className="font-bold text-sm text-white">{st.title}</h4>
                <p className="text-xs text-stone-300 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href={APP_ROUTES.SPECIALTIES.ONCOLOGY}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <span>Bắt Đầu Khám & Sàng Lọc Sức Khỏe Ngay</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
