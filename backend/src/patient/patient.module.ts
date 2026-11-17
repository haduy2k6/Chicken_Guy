// src/patient/patient.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CaseSupportModule } from '../case-support/case-support.module.js';
import { SchedulingModule } from '../scheduling/scheduling.module.js';
import { PatientController } from './patient.controller.js';
import { PatientService } from './patient.service.js';

@Module({
  imports: [AuthModule, CaseSupportModule, SchedulingModule],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
