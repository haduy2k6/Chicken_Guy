// redis/redis.service.ts
import { Inject, Injectable } from "@nestjs/common";
import { UPSTASH_REDIS } from "./redis.provider.js";
import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

@Injectable()
export class RedisUser {
  constructor(
    @Inject(UPSTASH_REDIS) private readonly cacheUser: Redis
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async saveRefresh(refreshToken: string, userId: string, ttlSeconds: number): Promise<void> {
    await this.cacheUser.set(`refresh:${userId}`, this.hashToken(refreshToken), { ex: ttlSeconds });
  }

  async checkRefresh(refreshToken: string, userId: string): Promise<boolean> {
    const storedHash = await this.cacheUser.get<string>(`refresh:${userId}`);
    if (!storedHash) return false;
    return this.hashToken(refreshToken) === storedHash;
  }

  async deleteRefresh(userId: string): Promise<void> {
    await this.cacheUser.del(`refresh:${userId}`);
  }

  async cacheUserProfile(userId: string, profile: any, ttlSeconds = 3600): Promise<void> {
    try {
      await this.cacheUser.set(`user:profile:${userId}`, JSON.stringify(profile), { ex: ttlSeconds });
    } catch (err) {
      console.warn("Failed to cache user profile in Redis", err);
    }
  }

  async getCachedUserProfile<T = any>(userId: string): Promise<T | null> {
    try {
      const data = await this.cacheUser.get<any>(`user:profile:${userId}`);
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }

  async invalidateUserProfile(userId: string): Promise<void> {
    try {
      await this.cacheUser.del(`user:profile:${userId}`);
    } catch (err) {
      console.warn("Failed to invalidate profile in Redis", err);
    }
  }

  async cleanupUserSession(userId: string): Promise<void> {
    await Promise.allSettled([
      this.cacheUser.del(`refresh:${userId}`),
      this.cacheUser.del(`user:profile:${userId}`),
    ]);
  }
}