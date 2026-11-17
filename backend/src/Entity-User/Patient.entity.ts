import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './User.entity.js';
import { MedicalCase } from './MedicalCase.entity.js';
import { Appointment } from './Appointment.entity.js';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

/** Chỉ giữ thông tin ổn định. Tuổi và yếu tố nguy cơ theo từng khoa nằm ở MedicalCase.intakeData */
@Entity('patient_profiles')
export class PatientProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (u) => u.patient, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @OneToMany(() => MedicalCase, (c) => c.patient)
  cases: Relation<MedicalCase[]>;

  @OneToMany(() => Appointment, (a) => a.patient)
  appointments: Relation<Appointment[]>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
