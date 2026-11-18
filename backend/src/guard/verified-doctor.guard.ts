import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorProfile } from '../Entity-User/Doctor.entity.js';

export interface DoctorCtx {
  /** doctor_profiles.id */
  id: string;
  /** users.id: dùng cho audit log */
  userId: string;
  specialtyIds: string[];
}

/** Chạy sau AccessGuard + RoleGuard: chỉ cho bác sĩ đã xác minh, có giấy phép và ít nhất một chuyên khoa */
@Injectable()
export class VerifiedDoctorGuard implements CanActivate {
  constructor(@InjectRepository(DoctorProfile) private readonly doctors: Repository<DoctorProfile>) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const profile = await this.doctors.findOne({
      where: { userId: req.user?.userId },
      relations: { specialties: true },
    });

    if (!profile?.isVerified || !profile.licenseNumber || profile.specialties.length === 0) {
      throw new ForbiddenException('Tài khoản bác sĩ chưa được xác minh chuyên khoa và giấy phép hành nghề');
    }

    const doctor: DoctorCtx = { id: profile.id, userId: profile.userId, specialtyIds: profile.specialties.map((s) => s.id) };
    req.user.doctor = doctor;
    return true;
  }
}
