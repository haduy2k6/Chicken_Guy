import { Global, Module } from '@nestjs/common';
import { UpstashRedisProvider } from './redis.provider.js';
import { RedisUser } from './redis.service.js';

@Global()
@Module({
  providers: [UpstashRedisProvider, RedisUser],
  exports: [UpstashRedisProvider, RedisUser],
})
export class RedisModule {}
