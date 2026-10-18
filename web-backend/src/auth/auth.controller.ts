// auth/auth.controller.ts
import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { GoogleGuard } from "../guard/google.guard.js";
import { RefreshGuard } from "../guard/refreshToken.guard.js";
import { AccessGuard } from "../guard/accessToken.guard.js";
import { AuthService } from "./auth.service.js";
import { UserRole } from "../Entity-User/User.entity.js";

@Controller('auth')
export class AuthController {
  private readonly ttlRefreshMs = 8 * 24 * 3600 * 1000;

  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: this.ttlRefreshMs,
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  async loginByGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    const { accessToken, refreshToken } = await this.authService.createToken(userId, role);

    this.setRefreshCookie(res, refreshToken);

    // Extract locale dynamic from OAuth state (vi or en)
    let locale = 'vi';
    if (req.query?.state) {
      try {
        const parsed = JSON.parse(req.query.state as string);
        if (parsed.locale) locale = parsed.locale;
      } catch {
        if (typeof req.query.state === 'string') locale = req.query.state;
      }
    }

    const frontUrl = process.env.FRONT || 'https://chicken-7mrhs5u3-haduy2k6s-projects.vercel.app';
    const siteRole = role === UserRole.DOCTOR ? 'doctor' : 'patient';
    const redirectUrl = `${frontUrl}/${locale}/${siteRole}`;
    return res.redirect(`${redirectUrl}?token=${accessToken}`);
  }

  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, refreshToken, role } = req.user;

    try {
      const result = await this.authService.refreshTokens(userId, refreshToken, role);
      if (result.refreshToken) {
        this.setRefreshCookie(res, result.refreshToken);
      }
      return { accessToken: result.accessToken, role: result.role };
    } catch (error) {
      this.clearRefreshCookie(res);
      throw error;
    }
  }

  @UseGuards(AccessGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    // Utilize Redis Cache first for sub-millisecond response time
    return this.authService.getProfile(req.user.userId);
  }

  @Post('logout')
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1. Always unconditionally clear the httpOnly refresh cookie
    this.clearRefreshCookie(res);

    // 2. Safely resolve userId without crashing if req.user is undefined
    try {
      let userId = req.user?.userId;
      if (!userId) {
        const token =
          req.cookies?.refreshToken ||
          req.get('Authorization')?.replace('Bearer', '').trim();
        if (token) {
          const decoded: any = this.authService.decodeToken(token);
          userId = decoded?.sub;
        }
      }

      if (userId) {
        await this.authService.logout(userId);
      }
    } catch (err) {
      // Safe failover
    }

    // 3. Return clean JSON for frontend Axios client
    return { success: true, message: 'Đăng xuất thành công' };
  }
}