import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { DoctorProfile } from './Doctor.entity.js';
import { PatientProfile } from './Patient.entity.js';

export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

/** Đăng nhập tra theo (provider, provider_id) nên chỉ cần 1 unique tổng hợp */
@Entity('users')
@Unique('UQ_users_provider_provider_id', ['provider', 'providerId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  provider: string; // 'google'

  @Column({ type: 'varchar', length: 255, name: 'provider_id' })
  providerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT, name: 'active_role' })
  activeRole: UserRole;

  @OneToOne(() => DoctorProfile, (d) => d.user)
  doctor?: Relation<DoctorProfile>;

  @OneToOne(() => PatientProfile, (p) => p.user)
  patient?: Relation<PatientProfile>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
