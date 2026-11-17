// strategy/refresh.strategy.ts
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import refreshJwt from "../../config/refresh.jwt.js";
import type { ConfigType } from "@nestjs/config";
import { Request } from 'express';
import { UserRole } from "../../Entity-User/User.entity.js";

interface JwtRefreshPayload {
  sub: string;
  role: UserRole;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(refreshJwt.KEY)
    private refreshConfig: ConfigType<typeof refreshJwt>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refreshToken || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: refreshConfig.secret!,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return {
      userId: payload.sub,
      role: payload.role,
      refreshToken,
    };
  }
}