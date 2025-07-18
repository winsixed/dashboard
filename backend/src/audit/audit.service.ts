import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(entity: string, entityId: number, action: 'CREATE' | 'UPDATE' | 'DELETE', userId: number, details: any) {
    await this.prisma.auditLog.create({
      data: {
        entity,
        entityId,
        action,
        userId,
        details,
      },
    });
  }
}
