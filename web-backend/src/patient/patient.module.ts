// src/patient/patient.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientProfile } from "../Entity-User/Patient.entity.js";
import { Diagnosis } from "../Entity-User/Diagnoses.entity.js";
import { User } from "../Entity-User/User.entity.js";
import { PatientController } from "./patient.controller.js";
import { PatientService } from "./patient.service.js";
import { AuthModule } from "../auth/auth.module.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientProfile, Diagnosis, User]),
    AuthModule,
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
