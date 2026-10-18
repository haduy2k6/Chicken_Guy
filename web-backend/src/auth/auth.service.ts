// auth/auth.service.ts
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "../Entity-User/User.entity.js";
import { Repository } from "typeorm";
import { CreateUserDTO } from "../dto/CreateUserGoogleDTO.dto.js";
import type { ConfigType } from "@nestjs/config";
import refreshJwt from "../config/refresh.jwt.js";
import { JwtService } from '@nestjs/jwt';
import { RedisUser } from "../redis/redis.service.js";
import { AuthUserDto, TokenResponseDto } from "../dto/auth.dto.js";

@Injectable()
export class AuthService {
  private readonly ttlRefreshSeconds = 8 * 24 * 3600;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisCache: RedisUser,
    @Inject(refreshJwt.KEY)
    private readonly refreshKey: ConfigType<typeof refreshJwt>,
    private readonly jwtService: JwtService,
  ) {}

  async createToken(userId: string, role: UserRole) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, role }),
      this.jwtService.signAsync({ sub: userId, role }, this.refreshKey),
    ]);

    await this.redisCache.saveRefresh(refreshToken, userId, this.ttlRefreshSeconds);
    return { accessToken, refreshToken };
  }

  async validate(appAuth: CreateUserDTO): Promise<AuthUserDto> {
    let user = await this.userRepository.findOne({
      where: {
        provider: appAuth.provider,
        providerId: appAuth.providerId,
      },
      select: { id: true, activeRole: true },
    });

    if (!user) {
      user = this.userRepository.create({
        provider: appAuth.provider,
        providerId: appAuth.providerId,
        activeRole: UserRole.PATIENT,
      });
      user = await this.userRepository.save(user);
    }

    const profile: AuthUserDto = { userId: user.id, role: user.activeRole };
    // Warm up Redis cache in background
    this.redisCache.cacheUserProfile(user.id, profile, 3600);
    return profile;
  }

  async getProfile(userId: string): Promise<AuthUserDto> {
    // 1. Check Redis Cache first (sub-millisecond latency)
    const cached = await this.redisCache.getCachedUserProfile<AuthUserDto>(userId);
    if (cached) {
      return cached;
    }

    // 2. Query Supabase
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, activeRole: true },
    });

    if (!user) {
      throw new UnauthorizedException("Người dùng không tồn tại hoặc đã bị thu hồi quyền");
    }

    const profile: AuthUserDto = { userId: user.id, role: user.activeRole };
    // Asynchronously cache into Redis
    this.redisCache.cacheUserProfile(userId, profile, 3600);
    return profile;
  }

  async refreshTokens(userId: string, incomingRefreshToken: string, role: UserRole): Promise<TokenResponseDto> {
    const isValid = await this.redisCache.checkRefresh(incomingRefreshToken, userId);

    if (!isValid) {
      await this.redisCache.cleanupUserSession(userId);
      throw new UnauthorizedException('Phiên làm việc không hợp lệ hoặc đã hết hạn');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.createToken(userId, role);
    return { accessToken, refreshToken: newRefreshToken, role };
  }

  async logout(userId: string): Promise<void> {
    await this.redisCache.cleanupUserSession(userId);
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}