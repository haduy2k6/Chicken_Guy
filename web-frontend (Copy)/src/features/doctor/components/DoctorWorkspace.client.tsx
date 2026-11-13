"use client";

import { useDoctorStore, SpecialtyType } from "@/src/StoreUser/Doctor/DoctorStore";
import { Stethoscope, Filter, AlertTriangle } from "lucide-react";

export function DoctorWorkspace() {
  const queue = useDoctorStore((s) => s.queue);
  const filterSpecialty = useDoctorStore((s) => s.filterSpecialty);
  const setFilterSpecialty = useDoctorStore((s) => s.setFilterSpecialty);
  const selectedPatientId = useDoctorStore((s) => s.selectedPatientId);
  const selectPatient = useDoctorStore((s) => s.selectPatient);

  const filteredQueue = queue.filter((p) =>
    filterSpecialty === "all" ? true : p.specialty === filterSpecialty
  );

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Cổng Bác Sĩ & Chuyên Gia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Danh Sách Ca Bệnh Chờ Hội Chẩn
          </h1>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white/80 rounded-2xl border border-stone-200/80 shadow-xs">
          <Filter className="w-3.5 h-3.5 text-stone-400 ml-2" />
          {(["all", "cancer", "kidney", "cardiology"] as SpecialtyType[]).map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setFilterSpecialty(sp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterSpecialty === sp
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              {sp === "all"
                ? "Tất cả"
                : sp === "cancer"
                ? "Ung bướu"
                : sp === "kidney"
                ? "Thận"
                : "Tim mạch"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQueue.map((patient) => {
          const isSelected = selectedPatientId === patient.id;
          return (
            <div
              key={patient.id}
              onClick={() => selectPatient(patient.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md ${
                isSelected
                  ? "border-cyan-600 ring-2 ring-cyan-600/20"
                  : "border-stone-200/80 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-stone-500">{patient.id}</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    patient.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {patient.status === "pending" ? "Chờ hội chẩn" : "Đã duyệt"}
                </span>
              </div>

              <h3 className="font-bold text-base text-stone-900">{patient.name}</h3>
              <p className="text-xs text-stone-500 mb-4">
                {patient.gender === "Male" ? "Nam" : "Nữ"} • {patient.age} tuổi • Ngày gửi: {patient.submissionDate}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  <span>
                    Điểm AI: <strong className="text-stone-900">{patient.aiRiskScore}%</strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-900"
                >
                  Xem chi tiết →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DoctorWorkspace;
