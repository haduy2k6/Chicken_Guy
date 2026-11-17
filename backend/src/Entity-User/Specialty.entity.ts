import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { DoctorProfile } from './Doctor.entity.js';

/** Khoa / chuyên khoa: oncology, nephrology, cardiology... */
@Entity('specialties')
@Unique('UQ_specialties_code', ['code'])
export class Specialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @ManyToMany(() => DoctorProfile, (d) => d.specialties)
  doctors: Relation<DoctorProfile[]>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
