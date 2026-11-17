import { randomBytes } from 'crypto';
import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { STATE_COOKIE, clearOptions, safeEqual, stateCookieOptions } from '../common/auth-cookie.util.js';
import { defaultFrontOrigin, normalizeLocale, resolveReturnOrigin } from '../common/safe-redirect.util.js';

export interface OAuthState {
  locale: 'vi' | 'en';
  origin: string;
}

const isCallback = (req: Request) => Boolean(req.query?.code || req.query?.error);

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  override canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { oauthState?: OAuthState }>();
    if (isCallback(req)) req.oauthState = this.consumeState(req, http.getResponse<Response>());
    return super.canActivate(context);
  }

  override getAuthenticateOptions(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    if (isCallback(req)) return {};

    const locale = normalizeLocale(req.query?.locale);
    const returnUrl = resolveReturnOrigin(req.query?.returnUrl) ?? resolveReturnOrigin(req.headers?.referer) ?? '';

    const nonce = randomBytes(24).toString('base64url');
    http.getResponse<Response>().cookie(STATE_COOKIE, nonce, stateCookieOptions());

    return { state: JSON.stringify({ locale, returnUrl, nonce }), prompt: 'select_account' };
  }

  private consumeState(req: Request, res: Response): OAuthState {
    const cookieNonce = req.cookies?.[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE, clearOptions(stateCookieOptions()));

    let parsed: { locale?: unknown; returnUrl?: unknown; nonce?: unknown } = {};
    try {
      const raw = req.query?.state;
      if (typeof raw === 'string') parsed = JSON.parse(raw);
    } catch {
      // state hỏng -> nonce không khớp ở dưới
    }

    if (!safeEqual(parsed.nonce, cookieNonce)) {
      throw new ForbiddenException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn, vui lòng thử lại');
    }
    return {
      locale: normalizeLocale(parsed.locale),
      origin: resolveReturnOrigin(parsed.returnUrl) ?? defaultFrontOrigin(),
    };
  }
}
