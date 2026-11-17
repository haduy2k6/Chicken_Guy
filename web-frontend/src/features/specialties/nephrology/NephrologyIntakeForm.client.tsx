"use client";

import { useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Loader2, Sparkles, Stethoscope, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";

interface KidneyResult {
  egfr: number;
  stage: string;
  stageNumber: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
}

export function NephrologyIntakeForm() {
  const [age, setAge] = useState<string>("48");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [creatinine, setCreatinine] = useState<string>("1.3");
  const [systolic, setSystolic] = useState<string>("135");
  const [diastolic, setDiastolic] = useState<string>("85");
  const [proteinuria, setProteinuria] = useState<string>("trace");
  const [symptoms, setSymptoms] = useState<string[]>(["foamy", "nocturia"]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<KidneyResult | null>(null);

  const toggleSymptom = (key: string) => {
    setSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const cr = parseFloat(creatinine) || 1.0;
      const a = parseInt(age, 10) || 45;
      
      let calculatedEgfr: number;
      if (gender === "female") {
        calculatedEgfr = cr <= 0.7
          ? 144 * Math.pow(cr / 0.7, -0.329) * Math.pow(0.993, a)
          : 144 * Math.pow(cr / 0.7, -1.209) * Math.pow(0.993, a);
      } else {
        calculatedEgfr = cr <= 0.9
          ? 141 * Math.pow(cr / 0.9, -0.411) * Math.pow(0.993, a)
          : 141 * Math.pow(cr / 0.9, -1.209) * Math.pow(0.993, a);
      }

      calculatedEgfr = Math.round(calculatedEgfr);

      let stage = "Chức năng lọc bình thường (Giai đoạn I)";
      let stageNumber = 1;
      let riskLevel: "low" | "medium" | "high" | "critical" = "low";
      const recs: string[] = [];

      if (calculatedEgfr >= 90) {
        stage = "Bình thường / Tổn thương thận nhẹ có eGFR bình thường (G1)";
        stageNumber = 1;
        riskLevel = "low";
        recs.push("Duy trì uống đủ 2 - 2.5 lít nước mỗi ngày");
        recs.push("Kiểm tra sức khỏe định kỳ mỗi 12 tháng");
      } else if (calculatedEgfr >= 60) {
        stage = "Suy giảm nhẹ mức lọc cầu thận (CKD G2)";
        stageNumber = 2;
        riskLevel = "medium";
        recs.push("Kiểm soát chặt chẽ huyết áp dưới 130/80 mmHg");
        recs.push("Giảm lượng muối ăn (< 5g/ngày) và hạn chế thực phẩm siêu chế biến");
        recs.push("Tái khám và định lượng Creatinine huyết thanh sau 3 - 6 tháng");
      } else if (calculatedEgfr >= 45) {
        stage = "Suy giảm mức lọc cầu thận trung bình nhẹ (CKD G3a)";
        stageNumber = 3;
        riskLevel = "high";
        recs.push("Khám chuyên khoa Thận - Tiết niệu để xác định nguyên nhân gốc");
        recs.push("Đo tỷ lệ Albumin/Creatinine nước tiểu (ACR) 24h");
        recs.push("Điều chỉnh liều lượng các thuốc thải trừ qua thận");
      } else if (calculatedEgfr >= 30) {
        stage = "Suy giảm mức lọc cầu thận trung bình nặng (CKD G3b)";
        stageNumber = 4;
        riskLevel = "high";
        recs.push("Chuyển tuyến khám bác sĩ chuyên khoa Thận");
        recs.push("Kiểm soát biến chứng thiếu máu, toan chuyển hóa và chuyển hóa khoáng xương");
      } else if (calculatedEgfr >= 15) {
        stage = "Suy thận nặng tiến triển (CKD G4)";
        stageNumber = 5;
        riskLevel = "critical";
        recs.push("Cần hội chẩn chuyên sâu để chuẩn bị kế hoạch lọc máu hoặc ghép thận");
        recs.push("Tuân thủ chế độ ăn kiêng Kali, Phosphat và đạm nghiêm ngặt");
      } else {
        stage = "Suy thận giai đoạn cuối (CKD G5 / ESRD)";
        stageNumber = 6;
        riskLevel = "critical";
        recs.push("Chỉ định điều trị thay thế thận (Chạy thận nhân tạo / Lọc màng bụng / Ghép)");
      }

      setResult({
        egfr: calculatedEgfr,
        stage,
        stageNumber,
        riskLevel,
        recommendations: recs,
      });

      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
      <div className="bg-linear-to-r from-cyan-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hệ thống AI Tầm Soát Bệnh Thận (CKD-Vision)</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Khám & Đánh Giá Chức Năng Lọc Thận Trực Tuyến
        </h3>
        <p className="text-cyan-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Nhập các chỉ số xét nghiệm sinh hóa và triệu chứng hiện tại để AI tính toán mức lọc cầu thận (eGFR theo chuẩn CKD-EPI) và phân tầng nguy cơ bệnh thận.
        </p>
      </div>

      <form onSubmit={handleEvaluate} className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Tuổi (Năm)</label>
            <input
              type="number"
              min="10"
              max="110"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-white"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Creatinine máu (mg/dL)</label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="20"
              required
              value={creatinine}
              onChange={(e) => setCreatinine(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Protein niệu</label>
            <select
              value={proteinuria}
              onChange={(e) => setProteinuria(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-white"
            >
              <option value="negative">Âm tính (Negative)</option>
              <option value="trace">Vết (Trace)</option>
              <option value="1plus">1+ (30 mg/dL)</option>
              <option value="2plus">2+ (100 mg/dL)</option>
              <option value="3plus">3+ (300 mg/dL trở lên)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Huyết áp tâm thu (mmHg)</label>
            <input
              type="number"
              min="60"
              max="250"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Huyết áp tâm trương (mmHg)</label>
            <input
              type="number"
              min="40"
              max="150"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-stone-100">
          <label className="text-xs font-bold text-stone-700">Triệu chứng lâm sàng ghi nhận:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              { id: "edema", label: "Phù mặt, mi mắt hoặc mắt cá chân" },
              { id: "foamy", label: "Nước tiểu có nhiều bọt lâu tan" },
              { id: "nocturia", label: "Đi tiểu đêm nhiều lần (> 2 lần/đêm)" },
              { id: "flank_pain", label: "Đau tức vùng hông lưng, quặn thận" },
              { id: "fatigue", label: "Mệt mỏi kéo dài, chán ăn, vị kim loại" },
              { id: "itchy", label: "Ngứa da không rõ nguyên nhân dị ứng" },
            ].map((sym) => {
              const checked = symptoms.includes(sym.id);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`text-left px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                    checked
                      ? "bg-cyan-50 border-cyan-400 text-cyan-950 font-bold shadow-xs"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {checked ? "✓ " : "+ "}
                  {sym.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang phân tích dữ liệu...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Chẩn Đoán & Tính Toán eGFR</span>
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="m-6 sm:m-8 p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                Kết Quả Đánh Giá Mức Lọc Cầu Thận
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
                {result.stage}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-cyan-700">{result.egfr}</span>
              <span className="text-xs font-bold text-stone-500">mL/phút/1.73m²</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-700">Khuyến nghị chuyên khoa từ AI:</div>
            <ul className="space-y-1.5 text-xs text-stone-600">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-stone-500 italic">
              * Kết quả sàng lọc mang tính hỗ trợ. Vui lòng đối chiếu với bác sĩ chuyên khoa Thận.
            </span>
            <Link
              href={APP_ROUTES.APPOINTMENTS}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gửi Hồ Sơ Cho Bác Sĩ Thận Hội Chẩn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NephrologyIntakeForm;
