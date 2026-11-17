// src/common/auth-cookie.util.ts
import { timingSafeEqual } from 'crypto';
import type { CookieOptions } from 'express';

export const REFRESH_COOKIE = 'refreshToken';
export const ROLE_COOKIE = 'role';
export const STATE_COOKIE = 'oauth_state';

/** Nguồn duy nhất cho hạn refresh: cookie, key Redis và `expiresIn` của refresh JWT đều lấy từ đây */
export const REFRESH_TTL_SECONDS = 8 * 24 * 3600;
export const REFRESH_TTL_MS = REFRESH_TTL_SECONDS * 1000;
const STATE_TTL_MS = 10 * 60 * 1000;

/**
 * Web và API khác site -> cookie phải SameSite=None; Secure.
 * Mặc định: production = cross-site. Đặt COOKIE_CROSS_SITE=false khi API cùng site (reverse proxy /api).
 */
export function isCrossSite(): boolean {
  const flag = process.env.COOKIE_CROSS_SITE;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

const domainOption = (): CookieOptions => (process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {});

function base(): CookieOptions {
  const cross = isCrossSite();
  return {
    secure: cross || process.env.NODE_ENV === 'production',
    sameSite: cross ? 'none' : 'lax',
    path: '/',
    ...domainOption(),
  };
}

export const refreshCookieOptions = (): CookieOptions => ({ ...base(), httpOnly: true, maxAge: REFRESH_TTL_MS });

/** Chỉ là gợi ý cho UI/middleware, KHÔNG dùng để phân quyền (quyền luôn lấy từ DB ở server) */
export const roleCookieOptions = (): CookieOptions => ({ ...base(), httpOnly: false, maxAge: REFRESH_TTL_MS });

/** Cookie nonce OAuth: luôn Lax vì callback của Google là điều hướng top-level GET */
export const stateCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: STATE_TTL_MS,
  ...domainOption(),
});

/** clearCookie phải dùng đúng sameSite/secure/domain lúc set */
export const clearOptions = (opts: CookieOptions): CookieOptions => {
  const { maxAge: _m, expires: _e, ...rest } = opts;
  return rest;
};

export function safeEqual(a: unknown, b: unknown): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
