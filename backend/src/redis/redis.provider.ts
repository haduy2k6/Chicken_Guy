import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

export const UPSTASH_REDIS = 'UPSTASH_REDIS';

export const UpstashRedisProvider: Provider = {
  provide: UPSTASH_REDIS,
  useFactory: (config: ConfigService) =>
    new Redis({
      url: config.getOrThrow<string>('UPSTASH_REDIS_REST_URL'),
      token: config.getOrThrow<string>('UPSTASH_REDIS_REST_TOKEN'),
    }),
  inject: [ConfigService],
};
