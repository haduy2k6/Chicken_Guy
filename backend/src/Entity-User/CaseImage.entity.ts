import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { MedicalCase } from './MedicalCase.entity.js';
import { AiAnalysis } from './AiAnalysis.entity.js';

export enum ImageKind {
  ENDOSCOPY = 'endoscopy',
  DOCUMENT = 'document',
  OTHER = 'other',
}

/** Ảnh / tài liệu bệnh nhân tải lên. Tệp nằm ở object storage, DB chỉ giữ khóa. */
@Entity('case_images')
@Index('IDX_case_images_case', ['caseId'])
export class CaseImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'case_id' })
  caseId: string;

  @ManyToOne(() => MedicalCase, (c) => c.images, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'case_id' })
  medicalCase: Relation<MedicalCase>;

  @Column({ type: 'enum', enum: ImageKind, default: ImageKind.ENDOSCOPY })
  kind: ImageKind;

  /** Khóa trong S3/MinIO. Trả cho client bằng signed URL ngắn hạn */
  @Column({ type: 'varchar', length: 500, name: 'storage_key' })
  storageKey: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name', nullable: true })
  originalName?: string;

  @Column({ type: 'int', name: 'size_bytes', default: 0 })
  sizeBytes: number;

  @OneToMany(() => AiAnalysis, (a) => a.image)
  analyses: Relation<AiAnalysis[]>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
