import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from "../../config/jwt.config.js";
import type { ConfigType } from "@nestjs/config";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private accessTokenConfig: ConfigType<typeof jwtConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessTokenConfig.secret!,
    });
  }

  async validate(payload: { sub: string; role: string }) {
  
    return { userId: payload.sub, role: payload.role };
  }
}