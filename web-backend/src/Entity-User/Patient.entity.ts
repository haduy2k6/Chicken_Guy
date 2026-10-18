import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './User.entity.js';
import { Diagnosis } from './Diagnoses.entity.js';
export enum DietIntake {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

@Entity('patient_profiles')
export class PatientProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (u) => u.patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  // --- 8 TRƯỜNG DỮ LIỆU DO BỆNH NHÂN NHẬP ---
  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'boolean', name: 'tobacco_use', default: false })
  tobaccoUse: boolean;

  @Column({ type: 'boolean', name: 'alcohol_consumption', default: false })
  alcoholConsumption: boolean;

  @Column({ type: 'boolean', name: 'betel_quid_use', default: false })
  betelQuidUse: boolean;

  @Column({ type: 'boolean', name: 'chronic_sun_exposure', default: false })
  chronicSunExposure: boolean;

  @Column({ type: 'boolean', name: 'poor_oral_hygiene', default: false })
  poorOralHygiene: boolean;

  @Column({
    type: 'enum',
    enum: DietIntake,
    name: 'diet_fruit_veg_intake',
    default: DietIntake.MODERATE,
  })
  dietFruitVegIntake: DietIntake;

  // Lịch sử khám bệnh / chẩn đoán
  @OneToMany(() => Diagnosis, (d) => d.patient)
  diagnoses: Relation<Diagnosis[]>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}