// src/common/google-callback.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { defaultFrontOrigin, normalizeLocale, resolveReturnOrigin } from './safe-redirect.util.js';

/**
 * Người dùng từ chối ở màn hình Google, nonce sai hoặc hết hạn: đưa về trang đăng nhập
 * kèm ?auth=error thay vì trả JSON 401/403 ngay trên trình duyệt.
 */
@Catch(HttpException)
export class GoogleCallbackFilter implements ExceptionFilter {
  catch(_exception: HttpException, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    let locale: 'vi' | 'en' = 'vi';
    let origin = defaultFrontOrigin();
    try {
      const raw = req.query?.state;
      if (typeof raw === 'string') {
        const state = JSON.parse(raw) as { locale?: unknown; returnUrl?: unknown };
        locale = normalizeLocale(state.locale);
        origin = resolveReturnOrigin(state.returnUrl) ?? origin;
      }
    } catch {
      // state hỏng: dùng mặc định
    }
    res.redirect(`${origin}/${locale}?auth=error`);
  }
}
