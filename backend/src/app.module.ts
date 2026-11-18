import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { CaseSupportModule } from './case-support/case-support.module.js';
import { validateEnv } from './config/env.validation.js';
import databaseConfig from './config/supabase.config.js';
import { DoctorModule } from './doctor/doctor.module.js';
import { PatientModule } from './patient/patient.module.js';
import { RedisModule } from './redis/redis.module.js';
import { SchedulingModule } from './scheduling/scheduling.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig], validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => db,
    }),
    ScheduleModule.forRoot(),
    // Mức chung rộng rãi; các route nhạy cảm (refresh, gửi hồ sơ) siết riêng bằng @Throttle
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    RedisModule,
    CaseSupportModule,
    SchedulingModule,
    AuthModule,
    PatientModule,
    DoctorModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
