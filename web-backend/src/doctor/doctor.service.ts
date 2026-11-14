import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from '../Entity-User/Diagnoses.entity.js';
import { DoctorProfile } from '../Entity-User/Doctor.entity.js';
import { User, UserRole } from '../Entity-User/User.entity.js';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepo: Repository<Diagnosis>,
    @InjectRepository(DoctorProfile)
    private readonly doctorRepo: Repository<DoctorProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getOrCreateDoctorProfile(userId: string): Promise<DoctorProfile> {
    let doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!doctor) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }
      doctor = this.doctorRepo.create({ user });
      doctor = await this.doctorRepo.save(doctor);
    }

    return doctor;
  }

  async getPatientQueue() {
    const diagnoses = await this.diagnosisRepo.find({
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
      order: { createdAt: 'DESC' },
    });

    return diagnoses.map((d) => {
      // Calculate a heuristic risk score based on lifestyle & symptoms
      let riskScore = 20;
      if (d.hpvInfection) riskScore += 25;
      if (d.oralLesions) riskScore += 20;
      if (d.whiteOrRedPatchesInMouth) riskScore += 15;
      if (d.unexplainedBleeding) riskScore += 15;
      if (d.difficultySwallowing) riskScore += 10;
      if (d.familyHistoryOfCancer) riskScore += 10;
      if (d.patient?.tobaccoUse) riskScore += 10;
      if (d.patient?.alcoholConsumption) riskScore += 10;
      if (riskScore > 98) riskScore = 98;

      const patientName =
        d.patient?.user?.name ||
        (d.patient?.user?.email ? d.patient.user.email.split('@')[0] : `Bệnh nhân #${d.id.slice(0, 5)}`);

      return {
        id: d.id,
        name: patientName,
        age: d.patient?.age || 35,
        gender: d.patient?.gender || 'Male',
        specialty: 'cancer' as const,
        submissionDate: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
        aiRiskScore: riskScore,
        status: (d.status as 'pending' | 'reviewed' | 'escalated') || 'pending',
        notes: d.notes,
        reviewerName: d.doctor?.user?.name,
      };
    });
  }

  async getCaseDetails(diagnosisId: string) {
    const diagnosis = await this.diagnosisRepo.findOne({
      where: { id: diagnosisId },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });

    if (!diagnosis) {
      throw new NotFoundException('Không tìm thấy ca bệnh này');
    }

    return diagnosis;
  }

  async reviewPatientCase(
    userId: string,
    diagnosisId: string,
    reviewData: {
      notes?: string;
      status?: string;
      cancerStage?: number;
      treatmentType?: any;
      oralCancerDiagnosis?: boolean;
    },
  ) {
    const doctor = await this.getOrCreateDoctorProfile(userId);
    const diagnosis = await this.diagnosisRepo.findOne({
      where: { id: diagnosisId },
    });

    if (!diagnosis) {
      throw new NotFoundException('Không tìm thấy ca bệnh tương ứng');
    }

    diagnosis.doctor = doctor;
    if (reviewData.notes !== undefined) {
      diagnosis.notes = reviewData.notes;
    }
    if (reviewData.status) {
      diagnosis.status = reviewData.status;
    }
    if (reviewData.cancerStage !== undefined) {
      diagnosis.cancerStage = reviewData.cancerStage;
    }
    if (reviewData.treatmentType) {
      diagnosis.treatmentType = reviewData.treatmentType;
    }
    if (reviewData.oralCancerDiagnosis !== undefined) {
      diagnosis.oralCancerDiagnosis = reviewData.oralCancerDiagnosis;
    }

    await this.diagnosisRepo.save(diagnosis);

    return {
      success: true,
      message: 'Đã cập nhật kết luận chuyên môn thành công!',
      caseId: diagnosis.id,
      status: diagnosis.status,
    };
  }
}
