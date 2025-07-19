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

  async list(filters: {
    model?: string;
    action?: string;
    userId?: number;
    from?: Date;
    to?: Date;
  }) {
    const where: any = {};
    if (filters.model) where.entity = filters.model;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.from || filters.to) {
      where.timestamp = {};
      if (filters.from) where.timestamp.gte = filters.from;
      if (filters.to) where.timestamp.lte = filters.to;
    }
    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    return logs.map(l => ({
      id: l.id,
      model: l.entity,
      modelId: l.entityId,
      action: l.action,
      diff: l.details,
      createdAt: l.timestamp,
      user: { id: l.user.id, fullName: `${l.user.firstName} ${l.user.lastName}` },
    }));
  }

  async paginate(page = 1, pageSize = 20) {
    const [total, logs] = await this.prisma.$transaction([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        orderBy: { id: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);
    return {
      total,
      items: logs.map(l => ({
        id: l.id,
        user: {
          id: l.user.id,
          firstName: l.user.firstName,
          lastName: l.user.lastName,
        },
        entity: l.entity,
        entityId: l.entityId,
        action: l.action,
        timestamp: l.timestamp,
        details: l.details,
      })),
    };
  }
}
