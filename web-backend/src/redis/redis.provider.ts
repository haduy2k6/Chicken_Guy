import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

export const UPSTASH_REDIS = 'UPSTASH_REDIS';

export const UpstashRedisProvider: Provider = {
  provide: UPSTASH_REDIS,
  useFactory: (configService: ConfigService) => {
    return new Redis({
      url: configService.get<string>('UPSTASH_REDIS_REST_URL'),
      token: configService.get<string>('UPSTASH_REDIS_REST_TOKEN'),
    });
  },
  inject: [ConfigService],
};