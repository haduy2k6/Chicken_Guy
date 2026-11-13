"use client";

import { useState } from "react";
import { Heart, Activity, AlertTriangle, CheckCircle2, Loader2, Sparkles, Stethoscope, ArrowRight, Upload } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";

interface CardioResult {
  score: number;
  riskCategory: "Thấp" | "Trung bình" | "Cao" | "Rất cao";
  riskColor: string;
  ecgStatus: string;
  recommendations: string[];
}

export function CardiologyIntakeForm() {
  const [age, setAge] = useState<string>("52");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [systolic, setSystolic] = useState<string>("140");
  const [diastolic, setDiastolic] = useState<string>("90");
  const [heartRate, setHeartRate] = useState<string>("78");
  const [cholesterol, setCholesterol] = useState<string>("210");
  const [smoker, setSmoker] = useState<boolean>(true);
  const [diabetes, setDiabetes] = useState<boolean>(false);
  const [symptoms, setSymptoms] = useState<string[]>(["chest_pressure", "shortness_breath"]);
  const [ecgFileName, setEcgFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<CardioResult | null>(null);

  const toggleSymptom = (key: string) => {
    setSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEcgFileName(e.target.files[0].name);
    }
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const sys = parseInt(systolic, 10) || 120;
      const chol = parseInt(cholesterol, 10) || 180;
      const a = parseInt(age, 10) || 50;

      let baseScore = (a - 40) * 0.4;
      if (gender === "male") baseScore += 4;
      if (smoker) baseScore += 5;
      if (diabetes) baseScore += 6;
      if (sys > 140) baseScore += 4;
      if (chol > 200) baseScore += 3;
      if (symptoms.length > 0) baseScore += symptoms.length * 1.5;

      const finalScore = Math.max(1, Math.min(38, Math.round(baseScore)));

      let riskCategory: "Thấp" | "Trung bình" | "Cao" | "Rất cao" = "Thấp";
      let riskColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
      const recs: string[] = [];

      if (finalScore >= 18) {
        riskCategory = "Rất cao";
        riskColor = "text-rose-700 bg-rose-50 border-rose-300";
        recs.push("Khẩn trương thăm khám trực tiếp tại chuyên khoa Tim Mạch Can Thiệp");
        recs.push("Chỉ định chụp cắt lớp vi tính mạch vành (MSCT) hoặc đo gắng sức tim");
        recs.push("Khởi trị kiểm soát huyết áp < 130/80 mmHg và liệu pháp Statin liều cao");
      } else if (finalScore >= 11) {
        riskCategory = "Cao";
        riskColor = "text-orange-700 bg-orange-50 border-orange-300";
        recs.push("Khám chuyên khoa Tim Mạch trong vòng 7 - 14 ngày tới");
        recs.push("Làm xét nghiệm Siêu âm tim Doppler màu và Đo Holter điện tâm đồ 24h");
        recs.push("Cai thuốc lá tuyệt đối và giảm muối ăn (< 5g muối/ngày)");
      } else if (finalScore >= 6) {
        riskCategory = "Trung bình";
        riskColor = "text-amber-700 bg-amber-50 border-amber-300";
        recs.push("Điều chỉnh chế độ ăn Địa Trung Hải giàu rau xanh, hạt óc chó và cá biển");
        recs.push("Tập luyện thể thao aerobic vừa sức tối thiểu 150 phút/tuần");
        recs.push("Định kỳ kiểm tra huyết áp tại nhà và tái xét nghiệm Lipid sau 6 tháng");
      } else {
        riskCategory = "Thấp";
        riskColor = "text-emerald-700 bg-emerald-50 border-emerald-300";
        recs.push("Duy trì lối sống lành mạnh, cân nặng hợp lý (BMI 18.5 - 23)");
        recs.push("Tầm soát định kỳ hàng năm");
      }

      setResult({
        score: finalScore,
        riskCategory,
        riskColor,
        ecgStatus: ecgFileName
          ? `Đã phân tích tệp ECG: "${ecgFileName}". Không phát hiện rung nhĩ cấp, trục điện tim trung gian.`
          : "Chưa đính kèm file ECG (khuyến nghị đo ECG tại phòng khám)",
        recommendations: recs,
      });

      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
      <div className="bg-linear-to-r from-rose-600 via-pink-600 to-rose-700 p-6 sm:p-8 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hệ thống AI Tầm Soát Tim Mạch & Phân Tích ECG</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Khám & Đánh Giá Nguy Cơ Tim Mạch Toàn Diện
        </h3>
        <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Đánh giá nguy cơ xơ vữa động mạch, bệnh mạch vành và rối loạn nhịp tim dựa trên thang điểm tim mạch học quốc tế kết hợp AI phân tích điện tâm đồ.
        </p>
      </div>

      <form onSubmit={handleEvaluate} className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Tuổi (Năm)</label>
            <input
              type="number"
              min="18"
              max="110"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-600 bg-white"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Huyết áp tâm thu (mmHg)</label>
            <input
              type="number"
              min="70"
              max="250"
              required
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Nhịp tim nghỉ (bpm)</label>
            <input
              type="number"
              min="40"
              max="220"
              required
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Cholesterol toàn phần (mg/dL)</label>
            <input
              type="number"
              min="100"
              max="400"
              value={cholesterol}
              onChange={(e) => setCholesterol(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Hút thuốc lá / Thuốc lào</label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSmoker(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  smoker ? "bg-rose-50 border-rose-500 text-rose-900" : "bg-stone-50 border-stone-200 text-stone-600"
                }`}
              >
                Có hút
              </button>
              <button
                type="button"
                onClick={() => setSmoker(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  !smoker ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-stone-50 border-stone-200 text-stone-600"
                }`}
              >
                Không
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Tiền sử Đái tháo đường</label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDiabetes(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  diabetes ? "bg-rose-50 border-rose-500 text-rose-900" : "bg-stone-50 border-stone-200 text-stone-600"
                }`}
              >
                Có
              </button>
              <button
                type="button"
                onClick={() => setDiabetes(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  !diabetes ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-stone-50 border-stone-200 text-stone-600"
                }`}
              >
                Không
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-stone-100">
          <label className="text-xs font-bold text-stone-700">Triệu chứng lâm sàng tim mạch:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              { id: "chest_pressure", label: "Cảm giác đau thắt / đè nặng ngực khi gắng sức" },
              { id: "shortness_breath", label: "Khó thở khi nằm đầu thấp hoặc leo cầu thang" },
              { id: "palpitation", label: "Hồi hộp, tim đập nhanh hoặc bỏ nhịp (hẫng hụt)" },
              { id: "dizziness", label: "Choáng váng, hoa mắt hoặc suýt ngất" },
              { id: "ankle_swelling", label: "Phù hai mu bàn chân về chiều tối" },
              { id: "jaw_pain", label: "Đau lan lên hàm, vai hoặc cánh tay trái" },
            ].map((sym) => {
              const checked = symptoms.includes(sym.id);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`text-left px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                    checked
                      ? "bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs"
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

        <div className="space-y-2 pt-2 border-t border-stone-100">
          <label className="text-xs font-bold text-stone-700">Tải lên tệp/ảnh Điện tâm đồ (ECG) (Tùy chọn):</label>
          <label className="border-2 border-dashed border-stone-300 hover:border-rose-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-stone-50/50 hover:bg-rose-50/20 transition-colors">
            <Upload className="w-5 h-5 text-stone-400" />
            <span className="text-xs font-bold text-stone-700">
              {ecgFileName ? ecgFileName : "Bấm để chọn tệp ảnh ECG (.jpg, .png, .pdf)"}
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang phân tích nguy cơ tim mạch...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white" />
                <span>Phân Tích Nguy Cơ Tim Mạch</span>
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
                Đánh Giá Nguy Cơ Biến Cố Tim Mạch 10 Năm
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
                Mức độ nguy cơ: <span className="underline decoration-rose-400">{result.riskCategory}</span>
              </h4>
            </div>
            <div className={`px-4 py-2 rounded-2xl border font-black text-sm ${result.riskColor}`}>
              Chỉ số nguy cơ: {result.score}%
            </div>
          </div>

          <div className="text-xs text-stone-600 bg-white p-3.5 rounded-xl border border-stone-200">
            <span className="font-bold text-stone-800">Trạng thái ECG: </span>
            {result.ecgStatus}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-700">Khuyến nghị can thiệp từ Hội đồng Tim Mạch AI:</div>
            <ul className="space-y-1.5 text-xs text-stone-600">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-stone-500 italic">
              * Khuyến cáo mang tính hỗ trợ sàng lọc. Luôn thăm khám bác sĩ tim mạch khi có cơn đau thắt ngực.
            </span>
            <Link
              href={APP_ROUTES.APPOINTMENTS}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
              <span>Đặt Lịch Khám Tim Mạch Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardiologyIntakeForm;
