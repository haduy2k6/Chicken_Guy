import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diagnosis } from '../Entity-User/Diagnoses.entity.js';
import { DoctorProfile } from '../Entity-User/Doctor.entity.js';
import { User } from '../Entity-User/User.entity.js';
import { DoctorController } from './doctor.controller.js';
import { DoctorService } from './doctor.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnosis, DoctorProfile, User])],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
