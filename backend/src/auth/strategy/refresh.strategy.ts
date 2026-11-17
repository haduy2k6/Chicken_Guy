import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { REFRESH_COOKIE } from '../../common/auth-cookie.util.js';
import refreshJwt from '../../config/refresh.jwt.js';

const extractRefreshToken = (req: Request): string | null => req?.cookies?.[REFRESH_COOKIE] ?? null;

/** Refresh token chỉ đi qua cookie httpOnly */
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(@Inject(refreshJwt.KEY) config: ConfigType<typeof refreshJwt>) {
    super({ jwtFromRequest: extractRefreshToken, secretOrKey: config.secret!, passReqToCallback: true });
  }

  async validate(req: Request, payload: { sub: string; sid?: string }) {
    const refreshToken = extractRefreshToken(req);
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');
    if (!payload.sid) throw new UnauthorizedException('Phiên đăng nhập cũ, vui lòng đăng nhập lại');
    return { userId: payload.sub, sid: payload.sid, refreshToken };
  }
}
