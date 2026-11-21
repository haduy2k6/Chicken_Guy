"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck, CalendarDays, Loader2 } from "lucide-react";
import { useDoctorAppointments, useDoctorAvailability, useSetAvailability } from "@/src/query/useScheduleQueries";
import { addDays, fmtDateTime, fmtDay, mondayOf, vnDateOf, vnToday } from "@/src/lib/date";
import { errMsg } from "@/src/lib/httpError";
import type { WorkSession } from "@/src/features/schedule/schedule.service";

const MAX_CASES_PER_DAY = 3;

const keyOf = (date: string, s: WorkSession) => `${date}|${s}`;

/** Bác sĩ chọn buổi làm việc theo tuần (không chọn = nghỉ) và xem lịch hẹn sắp tới */
export function DoctorSchedulePanel() {
  const t = useTranslations("DoctorSchedule");
  const sessions = useMemo<{ id: WorkSession; label: string }[]>(
    () => [
      { id: "morning", label: t("morning") },
      { id: "afternoon", label: t("afternoon") },
    ],
    [t]
  );
  const today = vnToday();
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const availability = useDoctorAvailability(weekStart);
  const save = useSetAvailability(weekStart);
  const appointments = useDoctorAppointments();
  const perDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of appointments.data ?? []) {
      if (a.status === "cancelled" || a.status === "no_show") continue;
      const d = vnDateOf(a.scheduledAt);
      m.set(d, (m.get(d) ?? 0) + 1);
    }
    return m;
  }, [appointments.data]);

  const [draft, setDraft] = useState<{ weekStart: string; selected: Set<string> } | null>(null);
  const savedSelection = useMemo(
    () => new Set((availability.data ?? []).map((s) => keyOf(s.date, s.session))),
    [availability.data],
  );
  const selected = draft?.weekStart === weekStart ? draft.selected : savedSelection;

  const toggle = (k: string) =>
    setDraft((current) => {
      const prev = current?.weekStart === weekStart ? current.selected : savedSelection;
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return { weekStart, selected: next };
    });

  const handleSave = () =>
    save.mutate([...selected].map((k) => ({ date: k.split("|")[0], session: k.split("|")[1] as WorkSession })), {
      onSuccess: () => setDraft(null),
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4" aria-label={t("workSchedule")}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-cyan-700" />
            {t("workSchedule")}
          </h3>
          <div className="flex items-center gap-1 text-xs font-bold">
            <button type="button" onClick={() => setWeekStart(addDays(weekStart, -7))} className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 cursor-pointer">‹</button>
            <span className="px-2 text-stone-600">{fmtDay(weekStart)} – {fmtDay(addDays(weekStart, 6))}</span>
            <button type="button" onClick={() => setWeekStart(addDays(weekStart, 7))} className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 cursor-pointer">›</button>
          </div>
        </div>

        <div className="space-y-1.5">
          {days.map((d) => (
            <div key={d} className="flex items-center justify-between gap-3 text-xs">
              <span className={`w-24 font-semibold ${d < today ? "text-stone-300" : "text-stone-700"}`}>{fmtDay(d)}</span>
              <span className={`text-[11px] font-bold ${(perDay.get(d) ?? 0) >= MAX_CASES_PER_DAY ? "text-rose-600" : "text-stone-400"}`}>
                {t("casesCount", { count: perDay.get(d) ?? 0, max: MAX_CASES_PER_DAY })}
              </span>
              <div className="flex gap-2">
                {sessions.map((s) => {
                  const k = keyOf(d, s.id);
                  const on = selected.has(k);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={d < today || availability.isLoading}
                      aria-pressed={on}
                      onClick={() => toggle(k)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                        on ? "bg-cyan-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={save.isPending || availability.isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 disabled:opacity-60 cursor-pointer"
          >
            {save.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {t("saveWeek")}
          </button>
          {save.isSuccess && <span role="status" className="text-xs font-semibold text-emerald-700">{t("saved")}</span>}
        </div>
        {save.isError && <p role="alert" className="text-xs font-semibold text-red-700">{errMsg(save.error)}</p>}
      </section>

      <section className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3" aria-label={t("upcomingAppointments")}>
        <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-cyan-700" />
          {t("upcomingAppointments")}
        </h3>
        {appointments.isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
        ) : appointments.error ? (
          <p role="alert" className="text-xs text-red-700 font-semibold">{errMsg(appointments.error)}</p>
        ) : !appointments.data?.length ? (
          <p className="text-xs text-stone-500">{t("noAppointments")}</p>
        ) : (
          <ul className="space-y-2">
            {appointments.data.map((a) => (
              <li key={a.id} className="rounded-xl bg-cyan-50/60 border border-cyan-100 p-3 text-xs">
                <p className="font-bold text-stone-900">{fmtDateTime(a.scheduledAt)}</p>
                <p className="text-stone-600">{a.patientName}{a.caseId ? ` • ca #${a.caseId.slice(0, 8)}` : ""}</p>
                {a.note && <p className="text-stone-500">{a.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DoctorSchedulePanel;
