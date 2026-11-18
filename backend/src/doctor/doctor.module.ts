// src/doctor/doctor.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorProfile } from '../Entity-User/Doctor.entity.js';
import { CaseSupportModule } from '../case-support/case-support.module.js';
import { SchedulingModule } from '../scheduling/scheduling.module.js';
import { DoctorController } from './doctor.controller.js';
import { DoctorService } from './doctor.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile]), CaseSupportModule, SchedulingModule],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
