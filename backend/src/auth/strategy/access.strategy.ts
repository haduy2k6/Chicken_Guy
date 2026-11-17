import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../../config/jwt.config.js';
import { AuthService } from '../auth.service.js';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>, private readonly authService: AuthService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.secret! });
  }

  /** Role luôn lấy từ profile (cache 5 phút / DB), không tin token */
  async validate(payload: { sub: string; sid?: string }) {
    const profile = await this.authService.getProfile(payload.sub);
    return { userId: payload.sub, role: profile.role, sid: payload.sid };
  }
}
