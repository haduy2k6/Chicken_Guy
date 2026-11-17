// src/case-support/ai-analysis.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, LessThan, Repository } from 'typeorm';
import { AiAnalysis, AnalysisStatus } from '../Entity-User/AiAnalysis.entity.js';
import { StorageService } from './storage.service.js';

export const MALIGNANT_LABEL = 'malignant';

/** Nest QUY ĐỊNH khóa; FastAPI chỉ ghi đúng khóa này vào bucket chung rồi trả lại */
export const gradcamKeyFor = (caseId: string, analysisId: string) => `cases/${caseId}/gradcam/${analysisId}.png`;
const GRADCAM_KEY_RE = /^cases\/[0-9a-f-]{36}\/gradcam\/[0-9a-f-]{36}\.png$/;

export interface AnalysisJob {
  analysisId: string;
  caseId: string;
  /** Ảnh gốc đã nằm trong bucket, FastAPI tự đọc theo khóa */
  imageKey: string;
  mimeType: string;
}

/** Body FastAPI gọi về POST /internal/ai/result */
export interface AiResult {
  analysis_id: string;
  status: 'completed' | 'failed';
  model_name?: string;
  model_version?: string;
  predicted_label?: string;
  probabilities?: Record<string, number>;
  risk_score?: number;
  gradcam_key?: string;
  raw_output?: Record<string, unknown>;
  error_message?: string;
}

const RESUBMIT_AFTER_MS = 3 * 60 * 1000;
const FAIL_AFTER_MS = 30 * 60 * 1000;
const RECONCILE_BATCH = 50;

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  private readonly baseUrl: string | undefined;
  private readonly callbackUrl: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly submitTimeoutMs: number;
  private reconciling = false;

  constructor(
    config: ConfigService,
    @InjectRepository(AiAnalysis) private readonly repo: Repository<AiAnalysis>,
    private readonly dataSource: DataSource,
    private readonly storage: StorageService,
  ) {
    this.baseUrl = config.get<string>('AI_SERVICE_URL')?.replace(/\/$/, '');
    this.callbackUrl = config.get<string>('AI_CALLBACK_URL'); // vd https://api.x.com/internal/ai/result
    this.apiKey = config.get<string>('AI_SERVICE_KEY');
    this.submitTimeoutMs = Number(config.get('AI_SUBMIT_TIMEOUT_MS') ?? 10_000);
  }

  // ------------------------------------------------------------ gửi job

  /** Không chặn request, không ném lỗi ra ngoài. Mất job do khởi động lại không sao: reconcile() gửi lại từ DB. */
  submit(jobs: AnalysisJob[]): void {
    void (async () => {
      for (const job of jobs) await this.submitOne(job);
    })().catch((err) => this.logger.error(`submit() lỗi không mong đợi: ${(err as Error).message}`));
  }

  private async submitOne(job: AnalysisJob): Promise<void> {
    if (!this.baseUrl || !this.callbackUrl || !this.apiKey) {
      await this.markFailed(job.analysisId, 'AI_SERVICE_URL / AI_CALLBACK_URL / AI_SERVICE_KEY chưa được cấu hình');
      return;
    }
    try {
      const res = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-AI-Key': this.apiKey },
        body: JSON.stringify({
          analysis_id: job.analysisId, // FastAPI phải idempotent theo analysis_id
          case_id: job.caseId,
          image_key: job.imageKey,
          mime_type: job.mimeType,
          gradcam_key: gradcamKeyFor(job.caseId, job.analysisId),
          callback_url: this.callbackUrl,
        }),
        signal: AbortSignal.timeout(this.submitTimeoutMs),
      });
      // 4xx (trừ 408/429) là lỗi vĩnh viễn của job: gửi lại cũng vô ích
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        await this.markFailed(job.analysisId, `Dịch vụ AI từ chối job (${res.status})`);
        return;
      }
      if (!res.ok) throw new Error(`Dịch vụ AI trả về ${res.status}`);
    } catch (err) {
      // Giữ nguyên "processing": reconcile() sẽ gửi lại
      this.logger.warn(`Gửi job ${job.analysisId} thất bại: ${(err as Error).message}`);
    }
  }

  // ------------------------------------------------------------ nhận kết quả

  async handleResult(dto: AiResult): Promise<void> {
    const analysis = await this.repo.findOne({ where: { id: dto.analysis_id } });

    // Ca đã bị xóa (loại ca / xác nhận chuyển tuyến) trong lúc AI chạy: dọn Grad-CAM mồ côi
    if (!analysis) {
      if (dto.gradcam_key && GRADCAM_KEY_RE.test(dto.gradcam_key)) await this.storage.removeMany([dto.gradcam_key]);
      return;
    }
    if (analysis.status === AnalysisStatus.COMPLETED) return; // callback lặp: idempotent

    if (dto.status === 'failed') {
      await this.markFailed(analysis.id, dto.error_message ?? 'Dịch vụ AI xử lý thất bại');
      return;
    }

    const raw =
      typeof dto.risk_score === 'number' ? dto.risk_score : (dto.probabilities?.[MALIGNANT_LABEL] ?? Number.NaN) * 100;
    if (!Number.isFinite(raw)) return this.markFailed(analysis.id, 'Dịch vụ AI không trả về điểm nguy cơ');
    if (!dto.model_name || !dto.model_version) {
      return this.markFailed(analysis.id, 'Dịch vụ AI không trả về tên/phiên bản model');
    }
    const riskScore = Math.min(100, Math.max(0, raw));

    // Chỉ nhận đúng khóa Nest đã quy định
    const expected = gradcamKeyFor(analysis.caseId, analysis.id);
    const gradcamKey = dto.gradcam_key === expected ? expected : null;
    if (dto.gradcam_key && !gradcamKey) this.logger.warn(`Bỏ qua gradcam_key lạ cho analysis ${analysis.id}`);

    const probabilities = Object.fromEntries(
      Object.entries(dto.probabilities ?? {}).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)),
    ) as Record<string, number>;

    // Cho phép "failed -> completed" nếu kết quả đến muộn sau khi đối soát đã đánh dấu lỗi
    const res = await this.repo.update(
      { id: analysis.id, status: In([AnalysisStatus.PROCESSING, AnalysisStatus.FAILED]) },
      {
        status: AnalysisStatus.COMPLETED,
        riskScore,
        predictedLabel: dto.predicted_label?.slice(0, 100) ?? null,
        probabilities,
        gradcamStorageKey: gradcamKey,
        rawOutput: (dto.raw_output ?? null) as any, // jsonb: QueryDeepPartialEntity không khớp Record<string, unknown>
        modelName: dto.model_name.slice(0, 100),
        modelVersion: dto.model_version.slice(0, 50),
        errorMessage: null,
      } as any,
    );

    if (!res.affected) {
      // dòng bị xóa giữa chừng (hoặc vừa được callback khác hoàn tất)
      if (gradcamKey) await this.storage.removeMany([gradcamKey]);
      return;
    }
    await this.refreshCaseScore(analysis.caseId);
  }

  private async markFailed(analysisId: string, message: string): Promise<void> {
    try {
      await this.repo.update(
        { id: analysisId, status: AnalysisStatus.PROCESSING },
        { status: AnalysisStatus.FAILED, errorMessage: message.slice(0, 1000) },
      );
    } catch (err) {
      this.logger.error(`Không cập nhật được trạng thái failed: ${(err as Error).message}`);
    }
  }

  /** Quá 30 phút thì đánh failed; 3–30 phút thì gửi lại. Nếu chạy nhiều instance, FastAPI idempotent nên không hại. */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async reconcile(): Promise<void> {
    if (this.reconciling) return;
    this.reconciling = true;
    try {
      const now = Date.now();
      const failBefore = new Date(now - FAIL_AFTER_MS);
      const resubmitBefore = new Date(now - RESUBMIT_AFTER_MS);

      await this.repo.update(
        { status: AnalysisStatus.PROCESSING, createdAt: LessThan(failBefore) },
        { status: AnalysisStatus.FAILED, errorMessage: 'Quá thời gian xử lý' },
      );

      const stuck = await this.repo.find({
        where: { status: AnalysisStatus.PROCESSING, createdAt: Between(failBefore, resubmitBefore) },
        relations: { image: true },
        order: { createdAt: 'ASC' },
        take: RECONCILE_BATCH,
      });
      for (const a of stuck) {
        await this.submitOne({ analysisId: a.id, caseId: a.caseId, imageKey: a.image.storageKey, mimeType: a.image.mimeType });
      }
      if (stuck.length) this.logger.log(`Đã gửi lại ${stuck.length} job AI chưa có kết quả`);
    } catch (err) {
      this.logger.warn(`Đối soát AI thất bại: ${(err as Error).message}`);
    } finally {
      this.reconciling = false;
    }
  }

  /** Điểm AI của ca = MAX điểm các ảnh đã phân tích xong (cột medical_cases.ai_risk_score) */
  private async refreshCaseScore(caseId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE "medical_cases"
          SET "ai_risk_score" = (SELECT MAX("risk_score") FROM "ai_analyses" WHERE "case_id" = $1 AND "status" = 'completed')
        WHERE "id" = $1`,
      [caseId],
    );
  }
}
