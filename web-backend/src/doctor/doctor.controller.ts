import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../guard/accessToken.guard.js';
import { DoctorService } from './doctor.service.js';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('queue')
  @UseGuards(AccessGuard)
  async getQueue() {
    return this.doctorService.getPatientQueue();
  }

  @Get('case/:id')
  @UseGuards(AccessGuard)
  async getCase(@Param('id') id: string) {
    return this.doctorService.getCaseDetails(id);
  }

  @Post('review/:id')
  @UseGuards(AccessGuard)
  async reviewCase(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: {
      notes?: string;
      status?: string;
      cancerStage?: number;
      treatmentType?: any;
      oralCancerDiagnosis?: boolean;
    },
  ) {
    const userId = req.user?.userId;
    return this.doctorService.reviewPatientCase(userId, id, body);
  }
}
