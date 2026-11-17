import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Nhật ký truy vết, chỉ thêm mới. Không dùng FK để log vẫn còn sau khi dữ liệu gốc bị xóa. */
@Entity('audit_logs')
@Index('IDX_audit_logs_entity', ['entityType', 'entityId', 'createdAt'])
@Index('IDX_audit_logs_actor_created', ['actorUserId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'actor_user_id', nullable: true })
  actorUserId?: string | null; // null nếu do hệ thống/job thực hiện

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 50, name: 'entity_type' })
  entityType: string;

  @Column({ type: 'uuid', name: 'entity_id' })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
