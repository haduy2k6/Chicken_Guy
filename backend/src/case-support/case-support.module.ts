// src/case-support/case-support.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalysis } from '../Entity-User/AiAnalysis.entity.js';
import { AuditLog } from '../Entity-User/AuditLog.entity.js';
import { AiAnalysisService } from './ai-analysis.service.js';
import { AiCallbackController, AiCallbackGuard } from './ai-callback.controller.js';
import { AuditService } from './audit.service.js';
import { StorageService } from './storage.service.js';

/** Dịch vụ dùng chung cho patient và doctor: lưu ảnh, điều phối AI (client mỏng), nhật ký truy vết */
@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysis, AuditLog])],
  controllers: [AiCallbackController],
  providers: [StorageService, AiAnalysisService, AuditService, AiCallbackGuard],
  exports: [StorageService, AiAnalysisService, AuditService],
})
export class CaseSupportModule {}
