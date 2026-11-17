import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { CaseSupportModule } from './case-support/case-support.module.js';
import databaseConfig from './config/supabase.config.js';
import { DoctorModule } from './doctor/doctor.module.js';
import { PatientModule } from './patient/patient.module.js';
import { RedisModule } from './redis/redis.module.js';
import { SchedulingModule } from './scheduling/scheduling.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => db,
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    CaseSupportModule,
    SchedulingModule,
    AuthModule,
    PatientModule,
    DoctorModule,
  ],
})
export class AppModule {}
