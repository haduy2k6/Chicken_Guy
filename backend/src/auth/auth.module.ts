import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtConfig from '../config/jwt.config.js';
import googleConfig from '../config/google.config.js';
import refreshJwt from '../config/refresh.jwt.js';
import { User } from '../Entity-User/User.entity.js';
import { RedisModule } from '../redis/redis.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AccessTokenStrategy } from './strategy/access.strategy.js';
import { GoogleStrategy } from './strategy/google.strategy.js';
import { RefreshTokenStrategy } from './strategy/refresh.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwt),
    ConfigModule.forFeature(googleConfig),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, GoogleStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
