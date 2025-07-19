import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const [
      usersCount,
      brandsCount,
      flavorsCount,
      requestsCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      latestRequests,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.brand.count(),
      this.prisma.flavor.count(),
      this.prisma.request.count(),
      this.prisma.request.count({ where: { status: 'pending' } }),
      this.prisma.request.count({ where: { status: 'approved' } }),
      this.prisma.request.count({ where: { status: 'rejected' } }),
      this.prisma.request.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          flavors: { include: { flavor: { select: { id: true, name: true } } } },
        },
      }),
    ]);

    return {
      usersCount,
      brandsCount,
      flavorsCount,
      requestsCount,
      requestsByStatus: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      latestRequests: latestRequests.map(r => ({
        id: r.id,
        status: r.status,
        createdAt: r.createdAt,
        comment: r.comment,
        user: {
          id: r.createdBy.id,
          firstName: r.createdBy.firstName,
          lastName: r.createdBy.lastName,
        },
        flavors: r.flavors.map(f => f.flavor),
      })),
    };
  }
}
