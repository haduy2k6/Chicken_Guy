import 'multer';
import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AccessGuard } from "../guard/accessToken.guard.js";
import { PatientService } from "./patient.service.js";

@Controller("patient")
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @UseGuards(AccessGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  async submitPatient(
    @Req() req: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: Record<string, any>
  ) {
    const userId = req.user?.userId;
    return this.patientService.createPatientRecord(userId, files || [], body);
  }
}
