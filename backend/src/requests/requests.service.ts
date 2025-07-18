import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list() {
    return this.prisma.request.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        flavor: { select: { id: true, name: true } },
      },
    });
  }

  async create(dto: CreateRequestDto, userId: number) {
    const request = await this.prisma.request.create({
      data: {
        flavorId: dto.flavorId,
        quantity: dto.quantity,
        userId,
      },
    });
    await this.audit.log('Request', request.id, 'CREATE', userId, dto);
    return request;
  }

  async updateStatus(id: number, status: string, userId: number) {
    const request = await this.prisma.request.update({
      where: { id },
      data: { status },
    });
    await this.audit.log('Request', id, 'UPDATE', userId, { status });
    return request;
  }
}
