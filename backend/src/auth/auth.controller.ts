import { randomUUID } from 'crypto';
import { Controller, ForbiddenException, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { UserRole } from '../Entity-User/User.entity.js';
import { REFRESH_COOKIE, ROLE_COOKIE, clearOptions, refreshCookieOptions, roleCookieOptions } from '../common/auth-cookie.util.js';
import { GoogleCallbackFilter } from '../common/google-callback.filter.js';
import { isAllowedOrigin } from '../common/safe-redirect.util.js';
import { AccessGuard } from '../guard/accessToken.guard.js';
import { GoogleGuard } from '../guard/google.guard.js';
import { RefreshGuard } from '../guard/refreshToken.guard.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private siteRole(role?: string): 'doctor' | 'patient' {
    return role === UserRole.DOCTOR ? 'doctor' : 'patient';
  }

  private setRefreshCookie(res: Response, token: string, siteRole: string) {
    res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());
    res.cookie(ROLE_COOKIE, siteRole, roleCookieOptions());
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, clearOptions(refreshCookieOptions()));
    res.clearCookie(ROLE_COOKIE, clearOptions(roleCookieOptions()));
  }

  /** Chống CSRF cho các POST dùng cookie: Origin (nếu có) phải nằm trong allowlist */
  private assertTrustedOrigin(req: Request) {
    if (!isAllowedOrigin(req.headers.origin)) throw new ForbiddenException('Origin không được phép');
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  async loginByGoogle() {}

  /** Nonce đã được GoogleGuard xác minh; `req.oauthState` chứa locale/origin an toàn. Lỗi đăng nhập → redirect ?auth=error */
  @Get('google/callback')
  @UseFilters(GoogleCallbackFilter)
  @UseGuards(GoogleGuard)
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const { locale, origin } = req.oauthState;
    const { userId, role } = req.user;

    const siteRole = this.siteRole(role);
    const { refreshToken } = await this.authService.createToken(userId, randomUUID());
    this.setRefreshCookie(res, refreshToken, siteRole);
    return res.redirect(`${origin}/${locale}/${siteRole}?auth=success`);
  }

  /** Mọi tab dùng chung cookie refresh: tab mới gọi endpoint này để lấy access token */
  @UseGuards(RefreshGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    this.assertTrustedOrigin(req);
    const { userId, sid, refreshToken } = req.user;

    try {
      const result = await this.authService.refreshTokens(userId, sid, refreshToken);
      const siteRole = this.siteRole(result.role);
      if (result.refreshToken) this.setRefreshCookie(res, result.refreshToken, siteRole);

      return { accessToken: result.accessToken, userId, role: siteRole, name: result.name, email: result.email, avatar: result.avatar };
    } catch (error) {
      if (error instanceof UnauthorizedException) this.clearRefreshCookie(res);
      throw error;
    }
  }

  @UseGuards(AccessGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.assertTrustedOrigin(req);
    this.clearRefreshCookie(res);

    const refreshCookie = req.cookies?.[REFRESH_COOKIE];
    const bearer = req.get('Authorization')?.replace(/^Bearer\s+/i, '').trim();

    const payload =
      (refreshCookie ? await this.authService.verifyRefreshToken(refreshCookie) : null) ??
      (bearer ? await this.authService.verifyAccessTokenIgnoringExpiry(bearer) : null);

    if (payload?.sub && payload.sid) {
      await this.authService.logoutSession(payload.sub, payload.sid).catch(() => undefined);
    }
    return { success: true, message: 'Đăng xuất thành công' };
  }

  @UseGuards(AccessGuard)
  @Post('logout-all')
  @HttpCode(200)
  async logoutAll(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    this.assertTrustedOrigin(req);
    this.clearRefreshCookie(res);
    await this.authService.logoutAll(req.user.userId);
    return { success: true, message: 'Đã đăng xuất khỏi mọi thiết bị' };
  }
}
