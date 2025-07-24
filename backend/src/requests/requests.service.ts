import { Injectable } from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async list(
    status?: RequestStatus,
    brandId?: number,
    sort?: string,
  ) {
    const where: Prisma.RequestWhereInput = {};
    if (status) {
      where.status = status;
    }
    if (brandId) {
      where.flavors = { some: { flavor: { brandId } } };
    }

    const orderBy: Prisma.RequestOrderByWithRelationInput[] = [];
    if (sort === 'createdAt_asc') orderBy.push({ createdAt: 'asc' });
    if (sort === 'createdAt_desc') orderBy.push({ createdAt: 'desc' });

    const requests = await this.prisma.request.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        flavors: { include: { flavor: { select: { id: true, name: true, brandId: true } } } },
      },
      orderBy: orderBy.length > 0 ? orderBy : undefined,
    });

    const result = requests.map(r => ({
      id: r.id,
      status: r.status,
      comment: r.comment,
      createdAt: r.createdAt,
      createdBy: r.createdBy,
      flavors: r.flavors.map(f => f.flavor),
    }));

    if (sort === 'flavor_asc') {
      result.sort((a, b) => {
        const an = a.flavors[0]?.name || '';
        const bn = b.flavors[0]?.name || '';
        return an.localeCompare(bn, 'ru');
      });
    } else if (sort === 'flavor_desc') {
      result.sort((a, b) => {
        const an = a.flavors[0]?.name || '';
        const bn = b.flavors[0]?.name || '';
        return bn.localeCompare(an, 'ru');
      });
    }

    return result;
  }

  async create(dto: CreateRequestDto, userId: number) {
    const request = await this.prisma.request.create({
      data: {
        comment: dto.comment,
        createdById: userId,
      },
    });

    if (dto.flavorIds && dto.flavorIds.length > 0) {
      await this.prisma.requestFlavor.createMany({
        data: dto.flavorIds.map(id => ({ requestId: request.id, flavorId: id })),
      });
    }

    await this.audit.log('Request', request.id, 'CREATE', userId, dto);

    return this.prisma.request.findUnique({
      where: { id: request.id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        flavors: { include: { flavor: { select: { id: true, name: true } } } },
      },
    });
  }

  async update(id: number, dto: UpdateRequestDto, userId: number) {
    const data: any = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.comment !== undefined) data.comment = dto.comment;

    const request = await this.prisma.request.update({ where: { id }, data });

    const diff = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    await this.audit.log('Request', id, 'UPDATE', userId, diff);

    return this.prisma.request.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        flavors: { include: { flavor: { select: { id: true, name: true } } } },
      },
    });
  }
}
