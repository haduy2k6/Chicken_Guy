"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Loader2, Send, Sparkles, Stethoscope, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { APP_ROUTES } from "@/src/config/routes.config";
import { useAuthStore } from "@/src/stores/authStore";
import { useUiStore } from "@/src/stores/uiStore";
import { usePatientQuota, useSubmitPatientMutation } from "@/src/query/usePatientQueries";
import { BLOCKED_MESSAGE, describeEviction } from "@/src/features/patient/Quota";
import { errMsg } from "@/src/lib/httpError";

interface KidneyResult {
  egfr: number;
  stage: string;
  recommendations: string[];
}

/** eGFR theo CKD-EPI 2009 (không hiệu chỉnh chủng tộc) */
function computeEgfr(creatinine: number, age: number, female: boolean): number {
  const kappa = female ? 0.7 : 0.9;
  const alpha = creatinine <= kappa ? (female ? -0.329 : -0.411) : -1.209;
  const base = female ? 144 : 141;
  return Math.round(base * Math.pow(creatinine / kappa, alpha) * Math.pow(0.993, age));
}

function classify(egfr: number): KidneyResult {
  if (egfr >= 90) {
    return {
      egfr,
      stage: "Bình thường / Tổn thương thận nhẹ có eGFR bình thường (G1)",
      recommendations: ["Duy trì uống đủ 2 - 2.5 lít nước mỗi ngày", "Kiểm tra sức khỏe định kỳ mỗi 12 tháng"],
    };
  }
  if (egfr >= 60) {
    return {
      egfr,
      stage: "Suy giảm nhẹ mức lọc cầu thận (CKD G2)",
      recommendations: [
        "Kiểm soát chặt chẽ huyết áp dưới 130/80 mmHg",
        "Giảm lượng muối ăn (< 5g/ngày) và hạn chế thực phẩm siêu chế biến",
        "Tái khám và định lượng Creatinine huyết thanh sau 3 - 6 tháng",
      ],
    };
  }
  if (egfr >= 45) {
    return {
      egfr,
      stage: "Suy giảm mức lọc cầu thận trung bình nhẹ (CKD G3a)",
      recommendations: [
        "Khám chuyên khoa Thận - Tiết niệu để xác định nguyên nhân gốc",
        "Đo tỷ lệ Albumin/Creatinine nước tiểu (ACR) 24h",
        "Điều chỉnh liều lượng các thuốc thải trừ qua thận",
      ],
    };
  }
  if (egfr >= 30) {
    return {
      egfr,
      stage: "Suy giảm mức lọc cầu thận trung bình nặng (CKD G3b)",
      recommendations: [
        "Chuyển tuyến khám bác sĩ chuyên khoa Thận",
        "Kiểm soát biến chứng thiếu máu, toan chuyển hóa và chuyển hóa khoáng xương",
      ],
    };
  }
  if (egfr >= 15) {
    return {
      egfr,
      stage: "Suy thận nặng tiến triển (CKD G4)",
      recommendations: [
        "Cần hội chẩn chuyên sâu để chuẩn bị kế hoạch lọc máu hoặc ghép thận",
        "Tuân thủ chế độ ăn kiêng Kali, Phosphat và đạm nghiêm ngặt",
      ],
    };
  }
  return {
    egfr,
    stage: "Suy thận giai đoạn cuối (CKD G5 / ESRD)",
    recommendations: ["Chỉ định điều trị thay thế thận (Chạy thận nhân tạo / Lọc màng bụng / Ghép)"],
  };
}

const INPUT =
  "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600";

export function NephrologyIntakeForm() {
  const user = useAuthStore((s) => s.user);
  const setSignInPopUp = useUiStore((s) => s.setSignInPopUp);
  const quota = usePatientQuota();
  const submit = useSubmitPatientMutation();

  const [age, setAge] = useState("48");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [creatinine, setCreatinine] = useState("1.3");
  const [systolic, setSystolic] = useState("135");
  const [diastolic, setDiastolic] = useState("85");
  const [proteinuria, setProteinuria] = useState("trace");
  const [result, setResult] = useState<KidneyResult | null>(null);
  const [sentMsg, setSentMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSentMsg(null);
    setResult(classify(computeEgfr(Number(creatinine), Number(age), gender === "Female")));
  };

  /** Gửi các chỉ số cho bác sĩ thận (backend validate theo INTAKE.nephrology, tính vào hạn mức 4 hồ sơ) */
  const handleSend = async () => {
    setError(null);
    if (!user) return setSignInPopUp(true);
    if (user.role !== "patient") return setError("Chỉ tài khoản bệnh nhân mới gửi được hồ sơ.");
    if (quota.blocked) return setError(BLOCKED_MESSAGE);
    if (quota.eviction && !window.confirm(`${describeEviction(quota.eviction)}\n\nTiếp tục gửi?`)) return;

    try {
      const res = await submit.mutateAsync({
        specialty: "nephrology",
        files: [],
        formValues: { age, gender, creatinine, systolic, diastolic, proteinuria },
      });
      setSentMsg(res.message || "Đã gửi hồ sơ cho bác sĩ thận.");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
      <div className="bg-linear-to-r from-cyan-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tầm soát bệnh thận mạn (CKD-EPI)</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Đánh Giá Chức Năng Lọc Thận Trực Tuyến</h3>
        <p className="text-cyan-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Nhập các chỉ số xét nghiệm để tính mức lọc cầu thận (eGFR theo CKD-EPI) và gửi hồ sơ cho bác sĩ chuyên khoa Thận thẩm định.
        </p>
      </div>

      <form onSubmit={handleEvaluate} className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="space-y-1.5 text-xs font-bold text-stone-700">
            Tuổi (năm)
            <input type="number" min={10} max={110} required value={age} onChange={(e) => setAge(e.target.value)} className={INPUT} />
          </label>

          <label className="space-y-1.5 text-xs font-bold text-stone-700">
            Giới tính
            <select value={gender} onChange={(e) => setGender(e.target.value as "Male" | "Female")} className={`${INPUT} bg-white`}>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </label>

          <label className="space-y-1.5 text-xs font-bold text-stone-700">
            Creatinine máu (mg/dL)
            <input type="number" step="0.05" min={0.1} max={20} required value={creatinine} onChange={(e) => setCreatinine(e.target.value)} className={INPUT} />
          </label>

          <label className="space-y-1.5 text-xs font-bold text-stone-700">
            Protein niệu
            <select value={proteinuria} onChange={(e) => setProteinuria(e.target.value)} className={`${INPUT} bg-white`}>
              <option value="negative">Âm tính (Negative)</option>
              <option value="trace">Vết (Trace)</option>
              <option value="1plus">1+ (30 mg/dL)</option>
              <option value="2plus">2+ (100 mg/dL)</option>
              <option value="3plus">3+ (300 mg/dL trở lên)</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
          <label className="space-y-1.5 text-xs font-bold text-stone-700">
            Huyết áp tâm thu (mmHg)
            <input type="number" min={60} max={250} required value={systolic} onChange={(e) => setSystolic(e.target.value)} className={INPUT} />
          </label>
          <label className="space-y-1.5 text-xs font-bold text-stone-700">
            Huyết áp tâm trương (mmHg)
            <input type="number" min={40} max={150} required value={diastolic} onChange={(e) => setDiastolic(e.target.value)} className={INPUT} />
          </label>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>Tính eGFR</span>
          </button>
        </div>
      </form>

      {result && (
        <div className="m-6 sm:m-8 p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Kết quả đánh giá mức lọc cầu thận</div>
              <h4 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">{result.stage}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-cyan-700">{result.egfr}</span>
              <span className="text-xs font-bold text-stone-500">mL/phút/1.73m²</span>
            </div>
          </div>

          <ul className="space-y-1.5 text-xs text-stone-600">
            {result.recommendations.map((rec) => (
              <li key={rec} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-stone-200 space-y-3">
            <span className="block text-[11px] text-stone-500 italic">
              * Kết quả mang tính hỗ trợ sàng lọc. Hãy gửi hồ sơ để bác sĩ chuyên khoa Thận đánh giá.
            </span>

            {sentMsg ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p role="status" className="text-xs font-semibold text-emerald-800">✓ {sentMsg}</p>
                <Link
                  href={APP_ROUTES.APPOINTMENTS}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Xem hồ sơ của tôi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={submit.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submit.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{user ? "Gửi hồ sơ cho bác sĩ Thận" : "Đăng nhập để gửi hồ sơ cho bác sĩ Thận"}</span>
              </button>
            )}

            {error && <p role="alert" className="text-xs font-semibold text-red-700">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default NephrologyIntakeForm;
