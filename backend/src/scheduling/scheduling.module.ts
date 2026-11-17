import { Module } from '@nestjs/common';
import { CaseSupportModule } from '../case-support/case-support.module.js';
import { PublicDoctorsController } from './scheduling.controller.js';
import { SchedulingService } from './scheduling.service.js';

@Module({
  imports: [CaseSupportModule],
  controllers: [PublicDoctorsController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
