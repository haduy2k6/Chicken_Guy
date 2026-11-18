import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MedicalCase } from './MedicalCase.entity.js';
import { DoctorProfile } from './Doctor.entity.js';
import { Specialty } from './Specialty.entity.js';

/**
 * Phiếu chuyển tuyến: chỉ là thông tin cho BỆNH NHÂN biết nên đến bác sĩ/khoa nào.
 * Bác sĩ nhận không nhìn thấy ca. Bệnh nhân xác nhận thì cả ca bị xóa (CASCADE).
 */
@Entity('referrals')
@Index('IDX_referrals_case', ['caseId'])
@Index('IDX_referrals_to_doctor', ['toDoctorId'])
@Index('IDX_referrals_to_specialty', ['toSpecialtyId'])
@Check('CK_referrals_has_receiver', '"to_doctor_id" IS NOT NULL OR "to_specialty_id" IS NOT NULL')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'case_id' })
  caseId: string;

  @ManyToOne(() => MedicalCase, (c) => c.referrals, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'case_id' })
  medicalCase: Relation<MedicalCase>;

  @Column({ type: 'uuid', name: 'from_doctor_id' })
  fromDoctorId: string;

  @ManyToOne(() => DoctorProfile, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'from_doctor_id' })
  fromDoctor: Relation<DoctorProfile>;

  @Column({ type: 'uuid', name: 'to_doctor_id', nullable: true })
  toDoctorId: string | null;

  @ManyToOne(() => DoctorProfile, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'to_doctor_id' })
  toDoctor?: Relation<DoctorProfile> | null;

  @Column({ type: 'uuid', name: 'to_specialty_id', nullable: true })
  toSpecialtyId: string | null;

  @ManyToOne(() => Specialty, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'to_specialty_id' })
  toSpecialty?: Relation<Specialty> | null;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
