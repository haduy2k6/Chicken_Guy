// redis/redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { createHash, timingSafeEqual } from 'crypto';
import { UPSTASH_REDIS } from './redis.provider.js';

/** current = token hiện hành; previous = token ngay trước đó (còn trong thời gian châm chước); invalid = replay/giả */
export type RefreshCheck = 'current' | 'previous' | 'invalid';

/** Sau khi xoay vòng, token cũ vẫn được chấp nhận ngần này giây (phản hồi bị mất, request đua nhau) */
const GRACE_SECONDS = 30;
const LOCK_SECONDS = 10;

/**
 * Mỗi thiết bị/trình duyệt đăng nhập = một session (sid) có refresh token riêng:
 *   refresh:{userId}:{sid}       hash token hiện hành
 *   refresh:prev:{userId}:{sid}  hash token liền trước (grace)
 *   sessions:{userId}            tập các sid còn hiệu lực (để đăng xuất mọi nơi)
 */
@Injectable()
export class RedisUser {
  constructor(@Inject(UPSTASH_REDIS) private readonly cacheUser: Redis) {}

  private hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

  private equalHex(a: unknown, b: string): boolean {
    if (a === null || a === undefined) return false;
    const x = Buffer.from(String(a));
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
  }

  private currentKey = (u: string, s: string) => `refresh:${u}:${s}`;
  private prevKey = (u: string, s: string) => `refresh:prev:${u}:${s}`;
  private lockKey = (u: string, s: string) => `refresh:lock:${u}:${s}`;
  private setKey = (u: string) => `sessions:${u}`;

  async saveRefresh(refreshToken: string, userId: string, sid: string, ttlSeconds: number): Promise<void> {
    const key = this.currentKey(userId, sid);
    const old = await this.cacheUser.get<string>(key);

    const p = this.cacheUser.pipeline();
    if (old) p.set(this.prevKey(userId, sid), String(old), { ex: GRACE_SECONDS });
    p.set(key, this.hashToken(refreshToken), { ex: ttlSeconds });
    p.sadd(this.setKey(userId), sid);
    p.expire(this.setKey(userId), ttlSeconds);
    await p.exec();
  }

  async checkRefresh(refreshToken: string, userId: string, sid: string): Promise<RefreshCheck> {
    const hash = this.hashToken(refreshToken);
    const [cur, prev] = await Promise.all([
      this.cacheUser.get<string>(this.currentKey(userId, sid)),
      this.cacheUser.get<string>(this.prevKey(userId, sid)),
    ]);
    if (this.equalHex(cur, hash)) return 'current';
    if (this.equalHex(prev, hash)) return 'previous';
    return 'invalid';
  }

  /** Khóa ngắn theo session để hai lần xoay vòng không chạy chồng nhau */
  async acquireRefreshLock(userId: string, sid: string): Promise<boolean> {
    const res = await this.cacheUser.set(this.lockKey(userId, sid), '1', { nx: true, ex: LOCK_SECONDS });
    return res === 'OK';
  }

  async releaseRefreshLock(userId: string, sid: string): Promise<void> {
    try {
      await this.cacheUser.del(this.lockKey(userId, sid));
    } catch {
      /* khóa tự hết hạn sau LOCK_SECONDS */
    }
  }

  /** Thu hồi đúng một thiết bị/trình duyệt */
  async revokeSession(userId: string, sid: string): Promise<void> {
    await Promise.allSettled([
      this.cacheUser.del(this.currentKey(userId, sid)),
      this.cacheUser.del(this.prevKey(userId, sid)),
      this.cacheUser.srem(this.setKey(userId), sid),
    ]);
  }

  /** Đăng xuất mọi nơi */
  async revokeAllSessions(userId: string): Promise<void> {
    let sids: string[] = [];
    try {
      sids = (await this.cacheUser.smembers(this.setKey(userId))) as string[];
    } catch {
      /* vẫn xóa phần còn lại */
    }
    await Promise.allSettled([
      ...sids.flatMap((s) => [
        this.cacheUser.del(this.currentKey(userId, s)),
        this.cacheUser.del(this.prevKey(userId, s)),
      ]),
      this.cacheUser.del(this.setKey(userId)),
      this.cacheUser.del(`user:profile:${userId}`),
    ]);
  }

  async cacheUserProfile(userId: string, profile: unknown, ttlSeconds = 300): Promise<void> {
    try {
      await this.cacheUser.set(`user:profile:${userId}`, JSON.stringify(profile), { ex: ttlSeconds });
    } catch (err) {
      console.warn('Failed to cache user profile in Redis', err);
    }
  }

  async getCachedUserProfile<T = unknown>(userId: string): Promise<T | null> {
    try {
      const data = await this.cacheUser.get<unknown>(`user:profile:${userId}`);
      if (!data) return null;
      return (typeof data === 'string' ? JSON.parse(data) : data) as T;
    } catch {
      return null;
    }
  }
}
