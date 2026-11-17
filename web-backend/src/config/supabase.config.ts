import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Diagnosis } from '../Entity-User/Diagnoses.entity.js';
import { DoctorProfile } from '../Entity-User/Doctor.entity.js';
import { PatientProfile } from '../Entity-User/Patient.entity.js';
import { User } from '../Entity-User/User.entity.js';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    entities:[Diagnosis,DoctorProfile,PatientProfile,User],
    ssl: { rejectUnauthorized: false },
    autoLoadEntities: true,
    synchronize: true,
    extra: { max: 10 },
  }),
);