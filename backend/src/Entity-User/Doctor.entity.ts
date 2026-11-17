import {
  Check, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne,
  PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './User.entity.js';
import { Specialty } from './Specialty.entity.js';
import { MedicalCase } from './MedicalCase.entity.js';
import { DoctorReview } from './DoctorReview.entity.js';
import { Appointment } from './Appointment.entity.js';

/**
 * Hồ sơ bác sĩ. Quản trị viên xác minh thủ công: is_verified, doctor_specialties, license_number, hospital.
 * CHECK bảo đảm bác sĩ đã xác minh luôn có số giấy phép và nơi công tác.
 */
@Entity('doctor_profiles')
@Unique('UQ_doctor_profiles_license', ['licenseNumber'])
@Check('CK_doctor_profiles_max_appointments', '"max_appointments_per_day" >= 1')
@Check('CK_doctor_profiles_experience', '"experience_years" >= 0')
@Check('CK_doctor_profiles_verified_has_credentials', '"is_verified" = false OR ("license_number" IS NOT NULL AND "hospital" IS NOT NULL)')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (u) => u.doctor, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToMany(() => Specialty, (s) => s.doctors)
  @JoinTable({ name: 'doctor_specialties', joinColumn: { name: 'doctor_id' }, inverseJoinColumn: { name: 'specialty_id' } })
  specialties: Relation<Specialty[]>;

  @Column({ type: 'varchar', length: 100, name: 'license_number', nullable: true })
  licenseNumber?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  degree?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hospital?: string;

  @Column({ type: 'int', name: 'experience_years', default: 0 })
  experienceYears: number;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified: boolean;

  /** Giới hạn số lịch hẹn mỗi ngày */
  @Column({ type: 'int', name: 'max_appointments_per_day', default: 3 })
  maxAppointmentsPerDay: number;

  @OneToMany(() => MedicalCase, (c) => c.assignedDoctor)
  assignedCases: Relation<MedicalCase[]>;

  @OneToMany(() => DoctorReview, (r) => r.doctor)
  reviews: Relation<DoctorReview[]>;

  @OneToMany(() => Appointment, (a) => a.doctor)
  appointments: Relation<Appointment[]>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
