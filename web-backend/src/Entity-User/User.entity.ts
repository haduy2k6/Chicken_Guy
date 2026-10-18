import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { DoctorProfile } from './Doctor.entity.js';
import { PatientProfile } from './Patient.entity.js'; 

export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

@Entity('users')
@Unique(['provider', 'providerId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Index()
  @Column({ type: 'varchar', length: 50 })
  provider: string; // 'google' | 'facebook'

  @Index()
  @Column({ type: 'varchar', length: 255, name: 'provider_id' })
  providerId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
    name: 'active_role',
  })
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