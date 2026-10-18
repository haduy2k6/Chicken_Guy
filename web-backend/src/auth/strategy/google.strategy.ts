import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import type { ConfigType } from "@nestjs/config";
import googleConfig from "../../config/google.config.js";
import { AuthService } from "../auth.service.js";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleConfig.KEY)
    private googleConfigure: ConfigType<typeof googleConfig>,
    private authService: AuthService
  ) {
    super({
      clientID: googleConfigure.clientId!, 
      clientSecret: googleConfigure.clientSecret!, 
      callbackURL: googleConfigure.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const {userId, role } = await this.authService.validate({
      provider: 'google',
      providerId: profile.id,
    });
    done(null, { userId, role });
  }
}