import { Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MedicalCase } from './MedicalCase.entity.js';
import { CaseImage } from './CaseImage.entity.js';

export enum AnalysisStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/** Kết quả AI cho từng ảnh. Backend điều phối FastAPI rồi lưu ở đây, không nhận điểm AI từ client. */
@Entity('ai_analyses')
@Index('IDX_ai_analyses_case', ['caseId'])
@Index('IDX_ai_analyses_image', ['imageId'])
@Check('CK_ai_analyses_risk_range', '"risk_score" IS NULL OR "risk_score" BETWEEN 0 AND 100')
@Check(
  'CK_ai_analyses_completed_complete',
  `"status" <> 'completed' OR ("risk_score" IS NOT NULL AND "model_name" IS NOT NULL AND "model_version" IS NOT NULL)`,
)
export class AiAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'case_id' })
  caseId: string;

  @ManyToOne(() => MedicalCase, (c) => c.aiAnalyses, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'case_id' })
  medicalCase: Relation<MedicalCase>;

  @Column({ type: 'uuid', name: 'image_id' })
  imageId: string;

  @ManyToOne(() => CaseImage, (i) => i.analyses, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'image_id' })
  image: Relation<CaseImage>;

  @Column({ type: 'enum', enum: AnalysisStatus, default: AnalysisStatus.PROCESSING })
  status: AnalysisStatus;

  /** Chỉ có khi FastAPI trả kết quả */
  @Column({ type: 'varchar', length: 100, name: 'model_name', nullable: true })
  modelName?: string | null;

  @Column({ type: 'varchar', length: 50, name: 'model_version', nullable: true })
  modelVersion?: string | null;

  /** 0–100 */
  @Column({ type: 'float', name: 'risk_score', nullable: true })
  riskScore?: number | null;

  @Column({ type: 'varchar', length: 100, name: 'predicted_label', nullable: true })
  predictedLabel?: string | null;

  /** Ví dụ { "malignant": 0.82, "benign": 0.18 } */
  @Column({ type: 'jsonb', nullable: true })
  probabilities?: Record<string, number> | null;

  /** Heatmap Grad-CAM trong object storage */
  @Column({ type: 'varchar', length: 500, name: 'gradcam_storage_key', nullable: true })
  gradcamStorageKey?: string | null;

  @Column({ type: 'jsonb', name: 'raw_output', nullable: true })
  rawOutput?: Record<string, unknown> | null;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
