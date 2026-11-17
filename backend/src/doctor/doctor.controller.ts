// src/doctor/doctor.controller.ts
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserRole } from '../Entity-User/User.entity.js';
import { Roles } from '../decorator/role.decorator.js';
import { AccessGuard } from '../guard/accessToken.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { DoctorCtx, VerifiedDoctorGuard } from '../guard/verified-doctor.guard.js';
import { SetAvailabilityDto, WeekQuery } from '../scheduling/scheduling.dto.js';
import { QueueQueryDto, ReviewCaseDto } from './doctor.dto.js';
import { DoctorService } from './doctor.service.js';

const doc = (req: any): DoctorCtx => req.user.doctor;

@Controller('doctor')
@UseGuards(AccessGuard, RoleGuard, VerifiedDoctorGuard)
@Roles([UserRole.DOCTOR])
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('queue')
  getQueue(@Req() req: any, @Query() query: QueueQueryDto) {
    return this.doctorService.getPatientQueue(doc(req), query);
  }

  @Get('referral-targets')
  getReferralTargets(@Req() req: any) {
    return this.doctorService.getReferralTargets(doc(req));
  }

  @Get('case/:id')
  getCase(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.getCaseDetails(doc(req), id);
  }

  @Post('review/:id')
  reviewCase(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() body: ReviewCaseDto) {
    return this.doctorService.reviewPatientCase(doc(req), id, body);
  }

  @Get('availability')
  getAvailability(@Req() req: any, @Query() q: WeekQuery) {
    return this.doctorService.getAvailability(doc(req), q.weekStart);
  }

  @Put('availability')
  setAvailability(@Req() req: any, @Body() body: SetAvailabilityDto) {
    return this.doctorService.setAvailability(doc(req), body);
  }

  @Get('appointments')
  getAppointments(@Req() req: any) {
    return this.doctorService.getAppointments(doc(req));
  }
}
