"use client";

import { useState } from "react";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Activity,
  Heart,
  ShieldAlert,
  ChevronRight,
  Filter,
  Check,
  X,
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: "Khám trực tiếp" | "Hội chẩn từ xa";
  status: "Chờ xác nhận" | "Đã xác nhận" | "Đã hoàn thành";
  notes?: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  specialty: string;
  specialtyIcon: any;
  title: string;
  aiConclusion: string;
  doctorReview: string;
  status: "Đã thẩm định" | "Chờ bác sĩ duyệt";
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    patientName: "Nguyễn Văn Hùng (48 tuổi)",
    doctorName: "PGS.TS.BS Nguyễn Văn An",
    specialty: "Ung bướu & Vòm họng",
    date: "2026-11-15",
    time: "09:30",
    type: "Khám trực tiếp",
    status: "Đã xác nhận",
    notes: "Nội soi lại vòm họng kiểm tra niêm mạc sau 3 tháng",
  },
  {
    id: "apt-2",
    patientName: "Trần Thị Mai (52 tuổi)",
    doctorName: "BS.CKII Trần Bích Ngọc",
    specialty: "Thận - Tiết niệu",
    date: "2026-11-18",
    time: "14:00",
    type: "Hội chẩn từ xa",
    status: "Chờ xác nhận",
    notes: "Đánh giá lại chỉ số Creatinine và eGFR định kỳ",
  },
  {
    id: "apt-3",
    patientName: "Lê Văn Tuấn (60 tuổi)",
    doctorName: "TS.BS Lê Hoàng Long",
    specialty: "Tim mạch",
    date: "2026-11-20",
    time: "10:15",
    type: "Khám trực tiếp",
    status: "Đã xác nhận",
    notes: "Theo dõi nhịp tim và kiểm soát huyết áp",
  },
];

const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec-1",
    date: "2026-10-25",
    specialty: "Ung bướu & Vòm họng",
    specialtyIcon: ShieldAlert,
    title: "Sàng lọc ảnh soi vòm họng NPC-Vision",
    aiConclusion: "AI kết luận: Nguy cơ thấp. Không phát hiện tổn thương sùi hoặc loét niêm mạc hố Rosenmuller.",
    doctorReview: "BS Nguyễn Văn An đã ký duyệt: Niêm mạc hồng hào, tái khám sau 6 tháng nếu không có triệu chứng bất thường.",
    status: "Đã thẩm định",
  },
  {
    id: "rec-2",
    date: "2026-10-12",
    specialty: "Thận - Tiết niệu",
    specialtyIcon: Activity,
    title: "Đánh giá mức lọc cầu thận eGFR & Creatinine",
    aiConclusion: "AI kết luận: eGFR 62 mL/phút/1.73m² (CKD G2 - Suy giảm nhẹ).",
    doctorReview: "BS Trần Bích Ngọc: Tiếp tục kiểm soát huyết áp < 130/80 mmHg, ăn nhạt, tránh thuốc độc cho thận.",
    status: "Đã thẩm định",
  },
  {
    id: "rec-3",
    date: "2026-09-18",
    specialty: "Tim mạch",
    specialtyIcon: Heart,
    title: "Phân tích nguy cơ tim mạch & Điện tâm đồ (ECG)",
    aiConclusion: "AI kết luận: Nguy cơ trung bình (Điểm tim mạch 8%). Sóng ECG nhịp xoang đều, tần số 74 bpm.",
    doctorReview: "TS.BS Lê Hoàng Long: Duy trì thể dục 150 phút/tuần, tái khám đo huyết áp sau 3 tháng.",
    status: "Đã thẩm định",
  },
];

export function AppointmentsWorkspace() {
  const user = useAuthStore((state) => state.user);
  
  const [roleMode, setRoleMode] = useState<"patient" | "doctor">(
    user?.role === "doctor" ? "doctor" : "patient"
  );
  const [patientTab, setPatientTab] = useState<"schedule" | "history">("schedule");
  const [doctorTab, setDoctorTab] = useState<"queue" | "reviews">("queue");

  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [records] = useState<MedicalRecord[]>(INITIAL_RECORDS);

  const [showBookModal, setShowBookModal] = useState<boolean>(false);
  const [newDoctor, setNewDoctor] = useState<string>("PGS.TS.BS Nguyễn Văn An");
  const [newSpecialty, setNewSpecialty] = useState<string>("Ung bướu & Vòm họng");
  const [newDate, setNewDate] = useState<string>("2026-11-22");
  const [newTime, setNewTime] = useState<string>("09:00");
  const [newNotes, setNewNotes] = useState<string>("");

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientName: user?.name || "Bệnh nhân (Tôi)",
      doctorName: newDoctor,
      specialty: newSpecialty,
      date: newDate,
      time: newTime,
      type: "Khám trực tiếp",
      status: "Chờ xác nhận",
      notes: newNotes || "Tư vấn & Sàng lọc sức khỏe",
    };
    setAppointments([newApt, ...appointments]);
    setShowBookModal(false);
    setNewNotes("");
  };

  const handleUpdateStatus = (id: string, newStatus: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <div className="w-full max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
            {roleMode === "doctor" ? <Stethoscope className="w-5 h-5 text-cyan-400" /> : <User className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <div className="text-xs text-stone-500 font-semibold">Vai trò hiện tại:</div>
            <div className="text-sm font-black text-stone-900">
              {roleMode === "doctor" ? "Bác sĩ Chuyên Khoa" : "Bệnh nhân"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setRoleMode("patient")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleMode === "patient"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Góc nhìn Bệnh Nhân
          </button>
          <button
            type="button"
            onClick={() => setRoleMode("doctor")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleMode === "doctor"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Góc nhìn Bác Sĩ
          </button>
        </div>
      </div>

      {roleMode === "patient" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPatientTab("schedule")}
                className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition-all ${
                  patientTab === "schedule"
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Lịch Hẹn Khám ({appointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPatientTab("history")}
                className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition-all ${
                  patientTab === "history"
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Lịch Sử Bệnh Án & Sàng Lọc ({records.length})</span>
              </button>
            </div>

            {patientTab === "schedule" && (
              <button
                type="button"
                onClick={() => setShowBookModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Đặt Lịch Khám Mới</span>
              </button>
            )}
          </div>

          {patientTab === "schedule" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                        {apt.specialty}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === "Đã xác nhận"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : apt.status === "Chờ xác nhận"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-stone-900">
                        {apt.doctorName}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium">
                        Hình thức: {apt.type}
                      </p>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-1.5 text-xs text-stone-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span className="font-semibold">{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span className="font-semibold">{apt.time}</span>
                      </div>
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-stone-600 italic">
                        &ldquo;{apt.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">Mã hẹn: #{apt.id}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(apt.id, "Đã hoàn thành")}
                      className="text-xs font-bold text-stone-700 hover:text-stone-900"
                    >
                      Chi tiết &gt;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((rec) => {
                const Icon = rec.specialtyIcon;
                return (
                  <div
                    key={rec.id}
                    className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                          <Icon className="w-5 h-5 text-cyan-700" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
                            {rec.specialty}
                          </span>
                          <h4 className="font-extrabold text-base text-stone-900">
                            {rec.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-400 font-semibold">{rec.date}</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {rec.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 text-xs space-y-2">
                      <div className="text-stone-800 font-medium">
                        <span className="font-bold text-stone-900">Phân tích AI: </span>
                        {rec.aiConclusion}
                      </div>
                      <div className="text-stone-700 pt-1 border-t border-stone-200/60">
                        <span className="font-bold text-cyan-900">Xác nhận Bác sĩ: </span>
                        {rec.doctorReview}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setDoctorTab("queue")}
                className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition-all ${
                  doctorTab === "queue"
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Lịch Khám & Hẹn Bệnh Nhân ({appointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setDoctorTab("reviews")}
                className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition-all ${
                  doctorTab === "reviews"
                    ? "border-stone-900 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hồ Sơ Chờ Duyệt Lâm Sàng ({records.length})</span>
              </button>
            </div>
          </div>

          {doctorTab === "queue" ? (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {apt.specialty}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">#{apt.id}</span>
                    </div>

                    <h4 className="font-extrabold text-base text-stone-900">
                      Bệnh nhân: {apt.patientName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        {apt.date} lúc {apt.time}
                      </span>
                      <span>Hình thức: {apt.type}</span>
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-stone-500 italic">
                        Lý do khám: {apt.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {apt.status === "Chờ xác nhận" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, "Đã xác nhận")}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Duyệt Lịch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, "Đã hoàn thành")}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Hủy</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          ✓ {apt.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, "Đã hoàn thành")}
                          className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Bắt đầu khám
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-cyan-800 uppercase">{rec.specialty}</span>
                      <h4 className="font-extrabold text-base text-stone-900">{rec.title}</h4>
                    </div>
                    <span className="text-xs text-stone-400 font-semibold">{rec.date}</span>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-3.5 text-xs text-stone-700 border border-stone-100">
                    <div className="font-bold text-stone-900 mb-1">Kết quả gợi ý từ AI:</div>
                    <p>{rec.aiConclusion}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-800">
                      Ghi chú lâm sàng & Ký duyệt của Bác sĩ:
                    </label>
                    <textarea
                      rows={2}
                      defaultValue={rec.doctorReview}
                      className="w-full rounded-xl border border-stone-300 p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Ký & Cập Nhật Hồ Sơ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-100">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900">Đặt Lịch Khám Chuyên Khoa</h3>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Chuyên khoa</label>
                <select
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="Ung bướu & Vòm họng">Ung bướu & Vòm họng</option>
                  <option value="Thận - Tiết niệu">Thận - Tiết niệu</option>
                  <option value="Tim mạch">Tim mạch</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Bác sĩ phụ trách</label>
                <select
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="PGS.TS.BS Nguyễn Văn An">PGS.TS.BS Nguyễn Văn An (Ung bướu)</option>
                  <option value="BS.CKII Trần Bích Ngọc">BS.CKII Trần Bích Ngọc (Thận)</option>
                  <option value="TS.BS Lê Hoàng Long">TS.BS Lê Hoàng Long (Tim mạch)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Ngày hẹn</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Giờ hẹn</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Lý do khám / Triệu chứng</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Mô tả triệu chứng hoặc lý do tái khám..."
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm"
                >
                  Xác Nhận Đặt Lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsWorkspace;
