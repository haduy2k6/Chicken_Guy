// src/patient/patient.controller.ts
import 'multer';
import {
  BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req,
  UploadedFiles, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserRole } from '../Entity-User/User.entity.js';
import { UploadErrorFilter } from '../common/upload-error.filter.js';
import { Roles } from '../decorator/role.decorator.js';
import { AccessGuard } from '../guard/accessToken.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { AvailableDoctorsQuery, BookAppointmentDto } from '../scheduling/scheduling.dto.js';
import { SchedulingService } from '../scheduling/scheduling.service.js';
import { PatientService } from './patient.service.js';

const MAX_FILES = 10;
const MAX_FILE_BYTES = 4 * 1024 * 1024; // khớp MAX_MB = 4 ở DropZone
const validation = new ValidationPipe({ whitelist: true, transform: true });

@Controller('patient')
@UseGuards(AccessGuard, RoleGuard)
@Roles([UserRole.PATIENT])
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly scheduling: SchedulingService,
  ) {}

  /** Lịch sử ca + hạn mức (nguồn sự thật duy nhất cho frontend) */
  @Get('history')
  getHistory(@Req() req: any) {
    return this.patientService.getHistory(req.user.userId);
  }

  /** Gửi hồ sơ: multipart gồm "files", "specialty" và các trường form */
  @Post()
  @UseFilters(UploadErrorFilter)
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
      fileFilter: (_req, file, cb) =>
        file.mimetype.startsWith('image/') ? cb(null, true) : cb(new BadRequestException('Chỉ chấp nhận tệp hình ảnh'), false),
    }),
  )
  submitPatient(@Req() req: any, @UploadedFiles() files: Express.Multer.File[], @Body() body: Record<string, unknown>) {
    return this.patientService.createPatientRecord(req.user.userId, files ?? [], body ?? {});
  }

  /** Xác nhận đã nhận thông tin chuyển tuyến: ca bị xóa khỏi hệ thống */
  @Post('cases/:id/confirm-referral')
  confirmReferral(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.patientService.confirmReferral(req.user.userId, id);
  }

  @Get('doctors')
  @UsePipes(validation)
  availableDoctors(@Req() req: any, @Query() q: AvailableDoctorsQuery) {
    return this.scheduling.availableDoctors(req.user.userId, q);
  }

  @Post('appointments')
  @UsePipes(validation)
  book(@Req() req: any, @Body() dto: BookAppointmentDto) {
    return this.scheduling.book(req.user.userId, dto);
  }
}
