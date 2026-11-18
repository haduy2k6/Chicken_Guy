"use client";

import { useState } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useAvailableDoctors, useBookAppointment } from "@/src/query/useScheduleQueries";
import { addDays, vnToday } from "@/src/lib/date";
import { errMsg } from "@/src/lib/httpError";
import type { WorkSession } from "@/src/features/schedule/schedule.service";

const SESSION_LABEL: Record<WorkSession, string> = {
  morning: "Sáng (8h–11h)",
  afternoon: "Chiều (14h–17h)",
};

/** Đặt lịch khám với bác sĩ đúng chuyên khoa, chỉ hiện các bác sĩ đang làm việc và còn chỗ ngày đã chọn */
export function BookAppointment({ caseId }: { caseId: string }) {
  const today = vnToday();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const doctors = useAvailableDoctors(caseId, date, open);
  const book = useBookAppointment();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-700 text-white text-xs font-bold hover:bg-cyan-800 cursor-pointer"
      >
        <CalendarPlus className="w-3.5 h-3.5" />
        Đặt lịch tái khám
      </button>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-100 space-y-3 text-xs text-cyan-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 font-semibold">
          Chọn ngày
          <input
            type="date"
            value={date}
            min={today}
            max={addDays(today, 14)}
            onChange={(e) => setDate(e.target.value || today)}
            className="rounded-lg border border-cyan-300 bg-white px-2 py-1 font-normal"
          />
        </label>
        <button type="button" onClick={() => setOpen(false)} className="font-bold underline-offset-2 hover:underline cursor-pointer">
          Đóng
        </button>
      </div>

      {doctors.isLoading ? (
        <p className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Đang tìm bác sĩ đang làm việc...</p>
      ) : doctors.error ? (
        <p role="alert" className="text-red-700 font-semibold">{errMsg(doctors.error)}</p>
      ) : !doctors.data?.length ? (
        <p>Không có bác sĩ nào còn lịch trống ngày này. Hãy chọn ngày khác.</p>
      ) : (
        <ul className="space-y-2">
          {doctors.data.map((d) => (
            <li key={d.doctorId} className="rounded-lg bg-white border border-cyan-100 p-3 space-y-2">
              <p className="font-bold text-stone-900">
                {d.name}
                {d.hospital ? <span className="font-normal text-stone-500"> • {d.hospital}</span> : null}
              </p>
              <div className="flex flex-wrap gap-2">
                {d.sessions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={book.isPending}
                    onClick={() => book.mutate({ caseId, doctorId: d.doctorId, date, session: s })}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-bold hover:bg-stone-800 disabled:opacity-60 cursor-pointer"
                  >
                    {SESSION_LABEL[s]}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {book.isError && <p role="alert" className="text-red-700 font-semibold">{errMsg(book.error)}</p>}
    </div>
  );
}

export default BookAppointment;
