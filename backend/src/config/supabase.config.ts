import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AiAnalysis } from '../Entity-User/AiAnalysis.entity.js';
import { Appointment } from '../Entity-User/Appointment.entity.js';
import { AuditLog } from '../Entity-User/AuditLog.entity.js';
import { CaseImage } from '../Entity-User/CaseImage.entity.js';
import { DoctorProfile } from '../Entity-User/Doctor.entity.js';
import { DoctorAvailability } from '../Entity-User/DoctorAvailability.entity.js';
import { DoctorReview } from '../Entity-User/DoctorReview.entity.js';
import { MedicalCase } from '../Entity-User/MedicalCase.entity.js';
import { PatientProfile } from '../Entity-User/Patient.entity.js';
import { Referral } from '../Entity-User/Referral.entity.js';
import { Specialty } from '../Entity-User/Specialty.entity.js';
import { User } from '../Entity-User/User.entity.js';

/**
 * Đặt DB_SSL_CA (nội dung chứng chỉ CA của Supabase, xuống dòng viết \n) để bật kiểm tra chứng chỉ.
 * Không đặt thì vẫn mã hóa nhưng không xác thực máy chủ: chỉ chấp nhận ở development.
 */
const sslOption = () => {
  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');
  return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false };
};

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    entities: [
      AiAnalysis, Appointment, AuditLog, CaseImage, DoctorAvailability, DoctorProfile,
      DoctorReview, MedicalCase, PatientProfile, Referral, Specialty, User,
    ],
    ssl: sslOption(),
    // Chỉ tự đồng bộ schema ở development; production dùng migration (hoặc DB_SYNC=true rõ ràng)
    synchronize: process.env.DB_SYNC ? process.env.DB_SYNC === 'true' : process.env.NODE_ENV === 'development',
    extra: {
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
  }),
);
