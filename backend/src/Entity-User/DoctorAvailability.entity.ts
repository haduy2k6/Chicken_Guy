import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import type { WorkSession } from '../common/app-time.util.js';
import { DoctorProfile } from './Doctor.entity.js';

/** Mỗi dòng = bác sĩ LÀM VIỆC ở buổi đó. Không có dòng = nghỉ. Bác sĩ ghi đè cả tuần mỗi lần cập nhật. */
@Entity('doctor_availability')
@Unique('UQ_doctor_availability', ['doctorId', 'workDate', 'session'])
export class DoctorAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'doctor_id' })
  doctorId: string;

  @ManyToOne(() => DoctorProfile, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Relation<DoctorProfile>;

  /** Ngày theo giờ Việt Nam, 'YYYY-MM-DD' */
  @Column({ type: 'date', name: 'work_date' })
  workDate: string;

  @Column({ type: 'enum', enum: ['morning', 'afternoon'], enumName: 'work_session' })
  session: WorkSession;
}
