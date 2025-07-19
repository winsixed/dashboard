import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async list(
    entity?: string,
    userId?: number,
    limit = 50,
    offset = 0,
  ) {
    const where: any = {};
    if (entity) where.entity = entity;
    if (userId !== undefined) where.userId = userId;

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    return logs.map(l => ({
      id: l.id,
      entity: l.entity,
      entityId: l.entityId,
      action: l.action,
      user: { id: l.user.id, firstName: l.user.firstName, lastName: l.user.lastName },
      timestamp: l.timestamp,
      details: l.details,
    }));
  }
}
