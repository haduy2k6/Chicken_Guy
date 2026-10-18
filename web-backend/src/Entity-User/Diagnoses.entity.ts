import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { DoctorProfile } from './Doctor.entity.js';
import { PatientProfile } from './Patient.entity.js'; 

export enum TreatmentType {
  NO_TREATMENT = 'No Treatment',
  SURGERY = 'Surgery',
  RADIATION = 'Radiation',
  CHEMOTHERAPY = 'Chemotherapy',
}

@Entity('diagnoses')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- QUAN HỆ ---
  @ManyToOne(() => PatientProfile, (p) => p.diagnoses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient: Relation<PatientProfile>;

  @ManyToOne(() => DoctorProfile, (d) => d.diagnoses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Relation<DoctorProfile>;

  // --- 15 TRƯỜNG DỮ LIỆU DO BÁC SĨ NHẬP ---
  @Column({ type: 'boolean', name: 'hpv_infection', default: false })
  hpvInfection: boolean;

  @Column({ type: 'boolean', name: 'family_history_of_cancer', default: false })
  familyHistoryOfCancer: boolean;

  @Column({ type: 'boolean', name: 'compromised_immune_system', default: false })
  compromisedImmuneSystem: boolean;

  @Column({ type: 'boolean', name: 'oral_lesions', default: false })
  oralLesions: boolean;

  @Column({ type: 'boolean', name: 'unexplained_bleeding', default: false })
  unexplainedBleeding: boolean;

  @Column({ type: 'boolean', name: 'difficulty_swallowing', default: false })
  difficultySwallowing: boolean;

  @Column({ type: 'boolean', name: 'white_or_red_patches_in_mouth', default: false })
  whiteOrRedPatchesInMouth: boolean;

  @Column({ type: 'float', name: 'tumor_size_cm', default: 0.0 })
  tumorSizeCm: number;

  @Column({ type: 'int', name: 'cancer_stage', default: 0 })
  cancerStage: number;

  @Column({
    type: 'enum',
    enum: TreatmentType,
    name: 'treatment_type',
    default: TreatmentType.NO_TREATMENT,
  })
  treatmentType: TreatmentType;

  @Column({ type: 'float', name: 'survival_rate_5yr', default: 0.0 })
  survivalRate5Yr: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'cost_of_treatment_usd',
    default: 0.0,
  })
  costOfTreatmentUsd: number;

  @Column({ type: 'int', name: 'lost_workdays_per_year', default: 0 })
  lostWorkdaysPerYear: number;

  @Column({ type: 'boolean', name: 'early_diagnosis', default: false })
  earlyDiagnosis: boolean;

  @Column({ type: 'boolean', name: 'oral_cancer_diagnosis', default: false })
  oralCancerDiagnosis: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}