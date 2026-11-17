// src/case-support/audit.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuditLog } from '../Entity-User/AuditLog.entity.js';

export interface AuditEntry {
  actorUserId: string | null;
  action: string; // 'case.created' | 'case.evicted' | 'review.created' | ...
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {}

  /** Truyền `manager` để ghi CÙNG transaction với nghiệp vụ. Không truyền: ghi độc lập, lỗi chỉ cảnh báo. */
  async log(entry: AuditEntry, manager?: EntityManager): Promise<void> {
    if (manager) {
      const repo = manager.getRepository(AuditLog);
      await repo.save(repo.create({ ...entry, metadata: entry.metadata ?? null }));
      return;
    }
    try {
      await this.repo.save(this.repo.create({ ...entry, metadata: entry.metadata ?? null }));
    } catch (err) {
      this.logger.warn(`Ghi audit log thất bại (${entry.action}): ${(err as Error).message}`);
    }
  }
}
