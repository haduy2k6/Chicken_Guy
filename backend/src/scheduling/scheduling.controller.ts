import { Controller, Get } from '@nestjs/common';
import { SchedulingService } from './scheduling.service.js';

/** Danh bạ bác sĩ công khai (chỉ bác sĩ đã xác minh, không lộ thông tin liên hệ) */
@Controller('doctors')
export class PublicDoctorsController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Get()
  list() {
    return this.scheduling.publicDoctors();
  }
}
