// auth/auth.service.ts
import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REFRESH_TTL_SECONDS } from '../common/auth-cookie.util.js';
import refreshJwt from '../config/refresh.jwt.js';
import type { AuthUserDto, TokenResponseDto } from '../dto/auth.dto.js';
import type { CreateUserDTO } from '../dto/create-user.dto.js';
import { User, UserRole } from '../Entity-User/User.entity.js';
import { RedisUser } from '../redis/redis.service.js';

/** Role lấy từ profile cache ở mỗi request, nên cache ngắn để đổi role có hiệu lực nhanh */
const PROFILE_TTL_SECONDS = 300;
const PROFILE_FIELDS = { id: true, activeRole: true, name: true, email: true, avatar: true } as const;

export interface VerifiedPayload {
  sub: string;
  sid?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly redisCache: RedisUser,
    @Inject(refreshJwt.KEY) private readonly refreshKey: ConfigType<typeof refreshJwt>,
    private readonly jwtService: JwtService,
  ) {}

  /** `sid` định danh một thiết bị/trình duyệt: tạo mới khi đăng nhập, giữ nguyên khi xoay vòng. Payload chỉ có sub + sid. */
  async createToken(userId: string, sid: string) {
    const payload = { sub: userId, sid };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshKey),
    ]);

    await this.redisCache.saveRefresh(refreshToken, userId, sid, REFRESH_TTL_SECONDS);
    return { accessToken, refreshToken };
  }

  async validate(appAuth: CreateUserDTO): Promise<AuthUserDto> {
    const existing = await this.userRepository.findOne({
      where: { provider: appAuth.provider, providerId: appAuth.providerId },
      select: PROFILE_FIELDS,
    });

    const user = existing
      ? await this.syncProfile(existing, appAuth)
      : await this.userRepository.save(
          this.userRepository.create({
            provider: appAuth.provider,
            providerId: appAuth.providerId,
            activeRole: UserRole.PATIENT,
            name: appAuth.name,
            email: appAuth.email,
            avatar: appAuth.avatar,
          }),
        );

    const profile = this.toProfile(user);
    await this.redisCache.cacheUserProfile(user.id, profile, PROFILE_TTL_SECONDS);
    return profile;
  }

  /** Chỉ ghi DB khi thông tin từ provider thực sự khác */
  private async syncProfile(user: User, incoming: CreateUserDTO): Promise<User> {
    let changed = false;
    for (const key of ['name', 'email', 'avatar'] as const) {
      const value = incoming[key];
      if (value && user[key] !== value) {
        user[key] = value;
        changed = true;
      }
    }
    return changed ? this.userRepository.save(user) : user;
  }

  private toProfile(user: User): AuthUserDto {
    return { userId: user.id, role: user.activeRole, name: user.name, email: user.email, avatar: user.avatar };
  }

  async getProfile(userId: string, fresh = false): Promise<AuthUserDto> {
    if (!fresh) {
      const cached = await this.redisCache.getCachedUserProfile<AuthUserDto>(userId);
      if (cached) return cached;
    }

    const user = await this.userRepository.findOne({ where: { id: userId }, select: PROFILE_FIELDS });
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại hoặc đã bị thu hồi quyền');

    const profile = this.toProfile(user);
    void this.redisCache.cacheUserProfile(userId, profile, PROFILE_TTL_SECONDS);
    return profile;
  }

  async refreshTokens(userId: string, sid: string, incomingRefreshToken: string): Promise<TokenResponseDto> {
    const locked = await this.redisCache.acquireRefreshLock(userId, sid);
    if (!locked) throw new HttpException('Phiên đang được làm mới, vui lòng thử lại', HttpStatus.TOO_MANY_REQUESTS);

    try {
      const state = await this.redisCache.checkRefresh(incomingRefreshToken, userId, sid);
      if (state === 'invalid') {
        await this.redisCache.revokeSession(userId, sid);
        throw new UnauthorizedException('Phiên làm việc không hợp lệ hoặc đã hết hạn');
      }

      let profile: AuthUserDto;
      try {
        profile = await this.getProfile(userId, true);
      } catch (err) {
        await this.redisCache.revokeSession(userId, sid);
        throw err;
      }

      const { accessToken, refreshToken } = await this.createToken(userId, sid);
      return { accessToken, refreshToken, role: profile.role, name: profile.name, email: profile.email, avatar: profile.avatar };
    } finally {
      await this.redisCache.releaseRefreshLock(userId, sid);
    }
  }

  async logoutSession(userId: string, sid: string): Promise<void> {
    await this.redisCache.revokeSession(userId, sid);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.redisCache.revokeAllSessions(userId);
  }

  // ---- xác minh token (KHÔNG dùng decode)
  async verifyRefreshToken(token: string): Promise<VerifiedPayload | null> {
    try {
      return await this.jwtService.verifyAsync<VerifiedPayload>(token, { secret: this.refreshKey.secret });
    } catch {
      return null;
    }
  }

  async verifyAccessTokenIgnoringExpiry(token: string): Promise<VerifiedPayload | null> {
    try {
      return await this.jwtService.verifyAsync<VerifiedPayload>(token, { ignoreExpiration: true });
    } catch {
      return null;
    }
  }
}
