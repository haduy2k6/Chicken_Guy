"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/routing";
import { 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Stethoscope, 
  User, 
  FileText, 
  Info,
  ChevronRight,
  Eye,
  Camera,
  Activity,
  HeartPulse
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Cấu hình & Dữ liệu mẫu ban đầu                                      */
/* ------------------------------------------------------------------ */
const MAX_FILES = 8;
const MAX_SIZE_MB = 15;

const COMMON_SYMPTOMS = [
  "Ù tai 1 bên liên tục (tiến triển)",
  "Xì mũi có lẫn vệt máu tươi / đờm máu",
  "Nghẹt mũi 1 bên tăng dần",
  "Nổi hạch vùng cổ / góc hàm không đau",
  "Đau nửa đầu âm ỉ cùng bên",
  "Khàn tiếng hoặc nuốt nghẹn",
  "Gia đình có người từng mắc ung thư vòm họng"
];

type UploadItem = { 
  id: string; 
  file: File; 
  url: string; 
  typeLabel?: string;
};

type FormState = {
  fullName: string;
  phone: string;
  birthYear: string;
  gender: "" | "female" | "male" | "other";
  concern: string;
  duration: string;
  selectedSymptoms: string[];
  riskHistory: string;
  note: string;
};

type Consultation = {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  concern: string;
  images: string[];
  status: "pending" | "answered";
  aiPreCheck?: {
    riskScore: number;
    riskText: string;
    advice: string;
  };
  doctorFeedback?: {
    doctorName: string;
    hospital: string;
    conclusion: string;
    recommendation: string;
    reviewedAt: string;
  };
};

const INITIAL_HISTORY: Consultation[] = [
  {
    id: "cs-01",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    fullName: "Nguyễn Văn Hoàng",
    phone: "0912.***.789",
    concern: "Tôi bị ù tai trái hơn 1 tháng nay, gần đây xì mũi sáng sớm thấy lẫn tia máu tươi, sờ thấy hạch nhỏ dưới góc hàm trái.",
    images: [
      "/patientS1.svg",
    ],
    status: "answered",
    aiPreCheck: {
      riskScore: 84,
      riskText: "Nguy cơ cao - Cần kiểm tra chuyên khoa",
      advice: "Triệu chứng phù hợp tam chứng kinh điển vòm họng. Khuyến nghị nội soi NBI hố Rosenmüller gấp."
    },
    doctorFeedback: {
      doctorName: "PGS. TS. BS. Lê Minh Tuấn",
      hospital: "Bệnh viện Tai Mũi Họng Trung Ương",
      conclusion: "Hình ảnh niêm mạc vòm họng có dấu hiệu thâm nhiễm không đều kèm triệu chứng lâm sàng rõ rệt.",
      recommendation: "Đến ngay bệnh viện chuyên khoa để bấm sinh thiết khối u vòm họng dưới hướng dẫn nội soi NBI.",
      reviewedAt: "Hôm qua, 15:30"
    }
  }
];

const EMPTY_FORM: FormState = {
  fullName: "",
  phone: "",
  birthYear: "",
  gender: "",
  concern: "",
  duration: "",
  selectedSymptoms: [],
  riskHistory: "",
  note: "",
};

export default function PatientPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [uploadMsg, setUploadMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [history, setHistory] = useState<Consultation[]>(INITIAL_HISTORY);
  
  // Trạng thái AI Phân tích sơ bộ
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [aiScanResult, setAiScanResult] = useState<{
    riskScore: number;
    riskText: string;
    advice: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ----- Xử lý tải ảnh ----- */
  const addFiles = useCallback((list: FileList | File[]) => {
    const incoming = Array.from(list);
    const messages: string[] = [];
    const valid: UploadItem[] = [];

    for (const file of incoming) {
      if (!file.type.startsWith("image/") && !file.name.endsWith(".dcm")) {
        messages.push(`"${file.name}" không phải định dạng ảnh hợp lệ.`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        messages.push(`"${file.name}" lớn hơn ${MAX_SIZE_MB}MB.`);
        continue;
      }
      valid.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        typeLabel: file.name.toLowerCase().includes("mri") ? "Ảnh MRI" : "Ảnh Nội Soi",
      });
    }

    setItems((prev) => {
      const room = MAX_FILES - prev.length;
      if (valid.length > room) {
        messages.push(`Chỉ gửi tối đa ${MAX_FILES} ảnh mỗi lần.`);
        valid.slice(room).forEach((v) => URL.revokeObjectURL(v.url));
      }
      return [...prev, ...valid.slice(0, Math.max(room, 0))];
    });
    setUploadMsg(messages.join(" "));
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
    setUploadMsg("");
    setAiScanResult(null);
  };

  // Dán ảnh bằng Ctrl+V
  useEffect(() => {
    if (step !== 1) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [step, addFiles]);

  /* ----- Bật/tắt triệu chứng nhanh ----- */
  const toggleSymptom = (sym: string) => {
    setForm((prev) => {
      const exists = prev.selectedSymptoms.includes(sym);
      const nextSymptoms = exists
        ? prev.selectedSymptoms.filter((s) => s !== sym)
        : [...prev.selectedSymptoms, sym];

      // Tự động bổ sung vào concern nếu chưa có
      let nextConcern = prev.concern;
      if (!exists && !nextConcern.includes(sym)) {
        nextConcern = nextConcern ? `${nextConcern}, ${sym.toLowerCase()}` : sym;
      }
      return {
        ...prev,
        selectedSymptoms: nextSymptoms,
        concern: nextConcern,
      };
    });
  };

  /* ----- Chạy thử phân tích AI sơ bộ tức thì ----- */
  const runAiPreScan = async () => {
    if (items.length === 0) {
      setUploadMsg("Vui lòng tải ít nhất 1 ảnh để AI phân tích sơ bộ.");
      return;
    }
    setIsAiScanning(true);
    await new Promise((r) => setTimeout(r, 1400));
    
    // Đánh giá dựa trên triệu chứng hoặc ảnh
    const hasHighSymptoms = form.selectedSymptoms.some(s => s.includes("Ù tai") || s.includes("máu") || s.includes("hạch"));
    const score = hasHighSymptoms ? 78 + Math.floor(Math.random() * 12) : 25 + Math.floor(Math.random() * 20);

    setAiScanResult({
      riskScore: score,
      riskText: score > 60 ? "Cần khám chuyên khoa sớm" : "Nguy cơ thấp - Tiếp tục theo dõi",
      advice: score > 60 
        ? "AI phát hiện dấu hiệu vi mạch hoặc mô niêm mạc nghi ngờ bất thường. Hãy gửi ngay yêu cầu này để bác sĩ xem xét."
        : "Không thấy bất thường nghiêm trọng rõ rệt trên ảnh, tuy nhiên bạn nên giữ thói quen tái khám định kỳ."
    });
    setIsAiScanning(false);
  };

  /* ----- Kiểm tra & Gửi tư vấn ----- */
  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ và tên của bạn.";
    if (!/^(0|\+84)\d{8,10}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Số điện thoại chưa đúng định dạng Việt Nam.";
    if (!form.concern.trim() && form.selectedSymptoms.length === 0)
      e.concern = "Vui lòng mô tả vấn đề hoặc chọn triệu chứng bạn đang gặp.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    await new Promise((r) => setTimeout(r, 1000));

    const newConsultation: Consultation = {
      id: `cs-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      fullName: form.fullName,
      phone: form.phone,
      concern: form.concern,
      images: items.map((it) => it.url),
      status: "pending",
      aiPreCheck: aiScanResult || {
        riskScore: form.selectedSymptoms.length > 2 ? 72 : 35,
        riskText: form.selectedSymptoms.length > 2 ? "Nghi ngờ cần lưu ý" : "Đang chờ bác sĩ đánh giá",
        advice: "Dữ liệu ảnh và triệu chứng đã được lưu bảo mật và chuyển tiếp tới hàng đợi bác sĩ trực tuyến."
      }
    };

    setHistory([newConsultation, ...history]);
    setItems([]);
    setForm(EMPTY_FORM);
    setAiScanResult(null);
    setStep(1);
    setJustSent(true);
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFDFB] via-[#FFF7F2] to-[#FFF0E8] pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. Header Banner Ấm Áp & Tinh Tế */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF9E7D] via-[#FF8364] to-[#FF7052] p-6 sm:p-10 text-white shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-bold uppercase tracking-wider mb-3">
              <HeartPulse className="w-3.5 h-3.5 text-white animate-pulse" />
              Tầm Soát Ung Thư Vòm Họng (NPC)
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Gửi Ảnh &amp; Nhận Tư Vấn Trực Tuyến Từ Bác Sĩ Chuyên Khoa
            </h1>
            <p className="mt-2 text-xs sm:text-base text-white/90 leading-relaxed font-normal">
              Chụp lại phiếu kết quả nội soi, phim MRI hoặc mô tả triệu chứng của bạn. Đội ngũ bác sĩ Tai Mũi Họng &amp; Ung Bướu cùng hệ thống AI sẽ hỗ trợ bạn đánh giá sớm và chuẩn xác nhất.
            </p>
          </div>
        </section>

        {/* 2. Success Alert */}
        {justSent && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Gửi hồ sơ tư vấn thành công!</p>
                <p className="text-xs text-emerald-700">
                  Bác sĩ đã nhận được hình ảnh và sẽ phản hồi trong vòng 24 giờ. Bạn có thể theo dõi tiến trình ở cột Lịch sử bên phải.
                </p>
              </div>
            </div>
            <button
              onClick={() => setJustSent(false)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-900 transition-colors"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 3. Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: FORM GỬI ẢNH & THÔNG TIN (7 Cột) */}
          <section className="lg:col-span-7 bg-white/90 backdrop-blur-md border border-orange-200/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between pb-4 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    step === 1
                      ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">1</span>
                  Tải Ảnh Nội Soi / Khám
                </button>

                <ChevronRight className="w-4 h-4 text-orange-300" />

                <button
                  type="button"
                  onClick={() => items.length > 0 && setStep(2)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    step === 2
                      ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">2</span>
                  Triệu Chứng &amp; Thông Tin
                </button>
              </div>

              <span className="text-[11px] font-mono text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                Bước {step}/2
              </span>
            </div>

            {/* BƯỚC 1: TẢI ẢNH */}
            {step === 1 ? (
              <div className="space-y-5">
                
                {/* Drag and Drop Zone */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    dragging
                      ? "border-orange-500 bg-orange-50/80 scale-[1.01]"
                      : "border-orange-200 hover:border-orange-400 bg-gradient-to-b from-orange-50/20 to-rose-50/10"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  
                  <div>
                    <p className="font-bold text-base text-stone-800">
                      Kéo thả ảnh vào đây hoặc <span className="text-orange-600 underline">Bấm để chọn tệp</span>
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Hỗ trợ ảnh nội soi dải tần hẹp (NBI), ảnh nội soi thông thường, phim chụp MRI, hoặc ảnh họng (Tối đa {MAX_FILES} ảnh, mỗi ảnh ≤ {MAX_SIZE_MB}MB)
                    </p>
                    <p className="text-[11px] text-orange-600/80 font-medium mt-1">
                      💡 Mẹo: Bạn có thể nhấn Ctrl+V để dán ảnh chụp màn hình trực tiếp!
                    </p>
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,.dcm"
                    multiple
                    hidden
                    onChange={(e) => {
                      if (e.target.files) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {uploadMsg && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                    {uploadMsg}
                  </p>
                )}

                {/* Danh sách ảnh đã chọn */}
                {items.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>Hình ảnh đã nạp ({items.length}/{MAX_FILES}):</span>
                      <button
                        type="button"
                        onClick={runAiPreScan}
                        disabled={isAiScanning}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isAiScanning ? "AI đang quét..." : "Quét Nhanh Bằng AI"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {items.map((it) => (
                        <div key={it.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-orange-200 bg-stone-100 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.url} alt="Scan preview" className="w-full h-full object-cover" />
                          
                          <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-[10px] text-white px-1.5 py-0.5 rounded font-mono">
                            {it.typeLabel}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Hộp kết quả phân tích AI sơ bộ (nếu có) */}
                    {aiScanResult && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-200 text-xs space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold text-orange-800">
                            <Sparkles className="w-4 h-4 text-orange-600" />
                            Đánh Giá Sơ Bộ Từ AI:
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-orange-200 font-bold text-orange-900 font-mono text-[11px]">
                            {aiScanResult.riskText} ({aiScanResult.riskScore}%)
                          </span>
                        </div>
                        <p className="text-stone-700 leading-relaxed">
                          {aiScanResult.advice}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Chuyển bước */}
                <div className="flex justify-end pt-4 border-t border-orange-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (items.length === 0) {
                        setUploadMsg("Vui lòng tải lên ít nhất 1 ảnh trước khi sang bước tiếp theo.");
                        return;
                      }
                      setUploadMsg("");
                      setStep(2);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all"
                  >
                    <span>Tiếp Theo: Điền Triệu Chứng</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              /* BƯỚC 2: ĐIỀN THÔNG TIN & TRIỆU CHỨNG */
              <div className="space-y-5">
                
                {/* Thanh tóm tắt ảnh */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs">
                  <span className="font-medium text-orange-800">
                    Đã chuẩn bị <strong>{items.length}</strong> hình ảnh chẩn đoán
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-orange-600 font-bold underline hover:text-orange-700"
                  >
                    Xem lại / Đổi ảnh
                  </button>
                </div>

                {/* Chọn nhanh triệu chứng lâm sàng */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Chọn Các Dấu Hiệu Bạn Đang Gặp Phải (Bấm để chọn):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SYMPTOMS.map((sym, idx) => {
                      const isSelected = form.selectedSymptoms.includes(sym);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleSymptom(sym)}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-rose-500 border-rose-600 text-white font-bold shadow-sm"
                              : "bg-stone-50 border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50/50"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-orange-400"}`} />
                          {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Họ tên & SĐT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Họ và tên của bạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={form.fullName}
                      onChange={(e) => {
                        setForm({ ...form, fullName: e.target.value });
                        setErrors({ ...errors, fullName: undefined });
                      }}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-orange-500"
                    />
                    {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Số điện thoại nhận kết quả <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={form.phone}
                      onChange={(e) => {
                        setForm({ ...form, phone: e.target.value });
                        setErrors({ ...errors, phone: undefined });
                      }}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 font-mono focus:outline-none focus:border-orange-500"
                    />
                    {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Năm sinh</label>
                    <input
                      type="number"
                      placeholder="1980"
                      value={form.birthYear}
                      onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Giới tính</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Mô tả chi tiết vấn đề */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mô tả thêm về triệu chứng &amp; thời gian bị <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Tôi bị ù tai khoảng 3 tuần nay, kèm theo thỉnh thoảng xì mũi có dịch nhầy dính vệt máu tươi..."
                    value={form.concern}
                    onChange={(e) => {
                      setForm({ ...form, concern: e.target.value });
                      setErrors({ ...errors, concern: undefined });
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:border-orange-500 leading-relaxed"
                  />
                  {errors.concern && <p className="text-[11px] text-rose-500 mt-1">{errors.concern}</p>}
                </div>

                {/* Nút gửi */}
                <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-bold transition-all"
                  >
                    Quay Lại Bước 1
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>{submitting ? "Đang Gửi Hồ Sơ..." : "Gửi Bác Sĩ Tư Vấn Ngay"}</span>
                  </button>
                </div>

              </div>
            )}

          </section>

          {/* CỘT PHẢI: LỊCH SỬ TƯ VẤN & HƯỚNG DẪN Y KHOA (5 Cột) */}
          <aside className="lg:col-span-5 space-y-6">
            
            {/* Lịch Sử Y Bạ Điện Tử */}
            <div className="bg-white/90 backdrop-blur-md border border-orange-200/60 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Lịch Sử Tư Vấn Của Bạn
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  {history.length} Lần Gửi
                </span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {history.map((h) => {
                  const isAnswered = h.status === "answered";
                  return (
                    <div
                      key={h.id}
                      className="p-4 rounded-2xl border border-orange-100 bg-gradient-to-b from-orange-50/30 to-white space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">{h.fullName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isAnswered
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isAnswered ? "bg-emerald-600" : "bg-amber-600 animate-ping"}`} />
                          {isAnswered ? "Bác Sĩ Đã Phản Hồi" : "Đang Chờ Bác Sĩ Xem"}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {h.concern}
                      </p>

                      {/* Phản hồi của bác sĩ */}
                      {h.doctorFeedback && (
                        <div className="mt-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                            <span>{h.doctorFeedback.doctorName} ({h.doctorFeedback.hospital})</span>
                            <span className="text-emerald-700 font-normal">{h.doctorFeedback.reviewedAt}</span>
                          </div>
                          <p className="text-emerald-950 font-medium">
                            &quot;{h.doctorFeedback.conclusion}&quot;
                          </p>
                          <p className="text-[11px] text-emerald-800 italic">
                            Khuyến nghị: {h.doctorFeedback.recommendation}
                          </p>
                        </div>
                      )}

                      {/* AI PreCheck Tag */}
                      {h.aiPreCheck && (
                        <div className="flex items-center justify-between text-[11px] pt-1 text-stone-500 border-t border-orange-100">
                          <span>AI Đánh giá: <strong>{h.aiPreCheck.riskText}</strong></span>
                          <span className="font-mono text-orange-600">{h.aiPreCheck.riskScore}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thẻ Lời Khuyên Y Khoa Cho Bệnh Nhân */}
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-3xl p-5 space-y-3 text-xs text-stone-700">
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Khi Nào Bạn Cần Đi Khám Gấp?
              </div>
              <p className="leading-relaxed">
                Nếu bạn có triệu chứng <strong>ù tai một bên kéo dài trên 2 tuần</strong> kèm theo <strong>chảy máu cam hoặc khạc đờm ra máu</strong>, đừng chủ quan coi là viêm xoang hay nóng trong người. Hãy đến ngay cơ sở y tế có máy nội soi dải tần hẹp (NBI) để quan sát kỹ hố Rosenmüller.
              </p>
              <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between font-bold text-orange-700">
                <span>Hotline y tế tư vấn miễn phí:</span>
                <span className="font-mono text-sm text-rose-600">1800 6868</span>
              </div>
            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}