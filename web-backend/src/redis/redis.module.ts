import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UpstashRedisProvider } from './redis.provider.js';
import { RedisUser } from './redis.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [UpstashRedisProvider, RedisUser],
  exports: [UpstashRedisProvider, RedisUser],
})
export class RedisModule {}