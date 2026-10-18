// src/patient/patient.service.ts
import 'multer';
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PatientProfile, Gender, DietIntake } from "../Entity-User/Patient.entity.js";
import { Diagnosis } from "../Entity-User/Diagnoses.entity.js";
import { User } from "../Entity-User/User.entity.js";

const isYes = (val: any): boolean => {
  return val === "Yes" || val === true || val === "true" || val === 1 || val === "1";
};

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientProfile)
    private readonly patientRepo: Repository<PatientProfile>,
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepo: Repository<Diagnosis>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createPatientRecord(
    userId: string,
    files: Array<Express.Multer.File>,
    body: Record<string, any>
  ) {
    // 1. Fetch user to verify existence
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại hoặc phiên đăng nhập không hợp lệ");
    }

    // 2. Perform atomic database transaction for Profile + Diagnosis
    return await this.dataSource.transaction(async (manager) => {
      // Find or create profile inside transaction
      let profile = await manager.findOne(PatientProfile, {
        where: { user: { id: userId } },
      });

      if (!profile) {
        profile = manager.create(PatientProfile, { user });
      }

      // Map lifestyle & demographic fields
      profile.age = Number(body["Age"]) || 30;
      profile.gender =
        body["Gender"] === "Female"
          ? Gender.FEMALE
          : body["Gender"] === "Other"
          ? Gender.OTHER
          : Gender.MALE;
      profile.tobaccoUse = isYes(body["Tobacco Use"]);
      profile.alcoholConsumption = isYes(body["Alcohol Consumption"]);
      profile.betelQuidUse = isYes(body["Betel Quid Use"]);
      profile.chronicSunExposure = isYes(body["Chronic Sun Exposure"]);
      profile.poorOralHygiene = isYes(body["Poor Oral Hygiene"]);

      const dietInput = body["Diet (Fruits & Vegetables Intake)"];
      profile.dietFruitVegIntake =
        dietInput === "Low"
          ? DietIntake.LOW
          : dietInput === "High"
          ? DietIntake.HIGH
          : DietIntake.MODERATE;

      // Save profile
      const savedProfile = await manager.save(PatientProfile, profile);

      // Create and save diagnosis linked to profile
      const diagnosis = manager.create(Diagnosis, {
        patient: savedProfile,
        hpvInfection: isYes(body["HPV Infection"]),
        familyHistoryOfCancer: isYes(body["Family History of Cancer"]),
        compromisedImmuneSystem: isYes(body["Compromised Immune System"]),
        oralLesions: isYes(body["Oral Lesions"]),
        unexplainedBleeding: isYes(body["Unexplained Bleeding"]),
        difficultySwallowing: isYes(body["Difficulty Swallowing"]),
        whiteOrRedPatchesInMouth: isYes(body["White or Red Patches in Mouth"]),
      });

      const savedDiagnosis = await manager.save(Diagnosis, diagnosis);

      return {
        success: true,
        message: "Hồ sơ và thông tin sàng lọc của bệnh nhân đã được ghi nhận thành công.",
        profileId: savedProfile.id,
        diagnosisId: savedDiagnosis.id,
        uploadedImagesCount: files ? files.length : 0,
      };
    });
  }
}