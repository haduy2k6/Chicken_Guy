// src/common/safe-redirect.util.ts
let cached: string[] | undefined;

/** Các origin frontend được phép. Đặt FRONT_ORIGINS="https://a.com,https://b.com". Production bắt buộc phải đặt. */
export function allowedOrigins(): string[] {
  if (cached) return cached;

  const list = (process.env.FRONT_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (list.length === 0) {
    if (process.env.NODE_ENV === 'production') throw new Error('Thiếu biến môi trường FRONT_ORIGINS');
    list.push('http://localhost:3002');
  }
  return (cached = list);
}

/** Dùng chung cho CORS và chống CSRF. Không có Origin = client không phải trình duyệt */
export function isAllowedOrigin(origin: unknown): boolean {
  if (!origin) return true;
  return typeof origin === 'string' && allowedOrigins().includes(origin);
}

/** Trả về origin nếu nằm trong danh sách cho phép, ngược lại null (chống open redirect) */
export function resolveReturnOrigin(candidate?: unknown): string | null {
  if (typeof candidate !== 'string' || !candidate) return null;
  try {
    const origin = new URL(candidate).origin;
    return allowedOrigins().includes(origin) ? origin : null;
  } catch {
    return null;
  }
}

export const defaultFrontOrigin = (): string => allowedOrigins()[0];

export const normalizeLocale = (value: unknown): 'vi' | 'en' => (value === 'en' ? 'en' : 'vi');
