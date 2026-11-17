import {
  Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PatientProfile } from './Patient.entity.js';
import { Specialty } from './Specialty.entity.js';
import { DoctorProfile } from './Doctor.entity.js';
import { CaseImage } from './CaseImage.entity.js';
import { AiAnalysis } from './AiAnalysis.entity.js';
import { DoctorReview } from './DoctorReview.entity.js';
import { Appointment } from './Appointment.entity.js';
import { Referral } from './Referral.entity.js';

/** Thứ tự khai báo = thứ tự sắp xếp của enum Postgres: hàng đợi dùng ORDER BY status ASC để ca chờ lên đầu */
export enum CaseStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ESCALATED = 'escalated',
}

/** CA KHÁM = một lần bệnh nhân gửi yêu cầu (1 bệnh nhân × 1 khoa), là "item" trong hàng đợi bác sĩ. */
@Entity('medical_cases')
@Index('IDX_cases_queue', ['specialtyId', 'status', 'aiRiskScore', 'createdAt'])
@Index('IDX_cases_patient_created', ['patientId', 'createdAt'])
@Index('IDX_cases_assigned_status', ['assignedDoctorId', 'status'])
@Check('CK_cases_risk_range', '"ai_risk_score" IS NULL OR "ai_risk_score" BETWEEN 0 AND 100')
export class MedicalCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => PatientProfile, (p) => p.cases, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient: Relation<PatientProfile>;

  @Column({ type: 'uuid', name: 'specialty_id' })
  specialtyId: string;

  @ManyToOne(() => Specialty, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'specialty_id' })
  specialty: Relation<Specialty>;

  /** Bác sĩ đã kết luận (reviewed). Chuyển tuyến thì để NULL: bác sĩ cũ không còn liên kết với ca */
  @Column({ type: 'uuid', name: 'assigned_doctor_id', nullable: true })
  assignedDoctorId: string | null;

  @ManyToOne(() => DoctorProfile, (d) => d.assignedCases, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_doctor_id' })
  assignedDoctor?: Relation<DoctorProfile> | null;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.PENDING })
  status: CaseStatus;

  /** Câu trả lời form khai báo (khóa camelCase, xem case-support/intake-schema.ts) */
  @Column({ type: 'jsonb', name: 'intake_data', default: () => "'{}'" })
  intakeData: Record<string, unknown>;

  /** Điểm AI cao nhất của ca (0–100), denormalize từ ai_analyses để sắp xếp hàng đợi */
  @Column({ type: 'float', name: 'ai_risk_score', nullable: true })
  aiRiskScore?: number | null;

  /** Optimistic locking: sai version → 409 */
  @VersionColumn()
  version: number;

  @OneToMany(() => CaseImage, (i) => i.medicalCase)
  images: Relation<CaseImage[]>;

  @OneToMany(() => AiAnalysis, (a) => a.medicalCase)
  aiAnalyses: Relation<AiAnalysis[]>;

  @OneToMany(() => DoctorReview, (r) => r.medicalCase)
  reviews: Relation<DoctorReview[]>;

  @OneToMany(() => Appointment, (a) => a.medicalCase)
  appointments: Relation<Appointment[]>;

  @OneToMany(() => Referral, (r) => r.medicalCase)
  referrals: Relation<Referral[]>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
