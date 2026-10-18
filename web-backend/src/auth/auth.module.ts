import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from "../config/jwt.config.js";
import googleConfig from "../config/google.config.js";
import refreshJwt from "../config/refresh.jwt.js";
import { AccessGuard } from "../guard/accessToken.guard.js";
import { GoogleGuard } from "../guard/google.guard.js";
import { RefreshGuard } from "../guard/refreshToken.guard.js";
import { RoleGuard } from "../guard/role.guard.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../Entity-User/User.entity.js";
import { AccessTokenStrategy } from "./strategy/access.strategy.js";
import { GoogleStrategy } from "./strategy/google.strategy.js";
import { RefreshTokenStrategy } from "./strategy/refresh.strategy.js";
import { AuthController } from "./auth.controller.js";
import { RedisModule } from "../redis/redis.module.js";
import { AuthService } from "./auth.service.js";

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(refreshJwt),
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(googleConfig),
        RedisModule

    ],
    controllers: [
        AuthController
    ],
    providers:[
        AuthService,
        AccessTokenStrategy,
        GoogleStrategy,
        RefreshTokenStrategy,
    
        AccessGuard,
        GoogleGuard,
        RefreshGuard,
        RoleGuard,
  ],
  exports: [AccessGuard, GoogleGuard, RefreshGuard, RoleGuard],
})

export class AuthModule { }