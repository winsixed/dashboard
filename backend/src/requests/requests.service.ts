import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async list() {
    const requests = await this.prisma.request.findMany({
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        flavors: { include: { flavor: { select: { id: true, name: true } } } },
      },
    });
    return requests.map(r => ({
      id: r.id,
      status: r.status,
      comment: r.comment,
      createdAt: r.createdAt,
      createdBy: r.createdBy,
      flavors: r.flavors.map(f => f.flavor),
    }));
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
