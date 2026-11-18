// src/common/app-time.util.ts
const TZ = 'Asia/Ho_Chi_Minh';
const dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false });

export type WorkSession = 'morning' | 'afternoon';

/** Giờ bắt đầu các khung hẹn trong mỗi buổi (giờ VN). Trần số ca/ngày do maxAppointmentsPerDay quyết định */
export const SESSION_HOURS: Record<WorkSession, number[]> = { morning: [8, 9, 10], afternoon: [14, 15, 16] };

/** 'YYYY-MM-DD' theo giờ Việt Nam */
export const toVnDate = (d: Date): string => dateFmt.format(d);

/** Chuỗi ngày hợp lệ và có thật (loại 2026-02-31, vì Date.parse có thể chấp nhận) */
export const isIsoDate = (v: unknown): v is string => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

/** Thời điểm UTC ứng với `date` + `hour` giờ VN (VN không có giờ mùa hè nên cố định +07:00) */
export const vnDateTime = (date: string, hour: number): Date =>
  new Date(`${date}T${String(hour).padStart(2, '0')}:00:00+07:00`);

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const sessionOf = (d: Date): WorkSession => (Number(hourFmt.format(d)) % 24 < 12 ? 'morning' : 'afternoon');
