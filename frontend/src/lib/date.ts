const TZ = "Asia/Ho_Chi_Minh";
const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** 'YYYY-MM-DD' theo giờ Việt Nam */
export const vnToday = (): string => dateFmt.format(new Date());

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Thứ Hai của tuần chứa `date` */
export function mondayOf(date: string): string {
  const dow = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  return addDays(date, -dow);
}

export const fmtDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("vi-VN", {
    timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

export const fmtDay = (date: string): string =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("vi-VN", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "2-digit" });

/** 'YYYY-MM-DD' (giờ VN) của một mốc ISO */
export const vnDateOf = (iso: string): string => dateFmt.format(new Date(iso));
