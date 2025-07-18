import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list() {
    return this.prisma.brand.findMany();
  }

  async create(dto: CreateBrandDto, userId: number) {
    const brand = await this.prisma.brand.create({ data: { name: dto.name } });
    await this.audit.log('Brand', brand.id, 'CREATE', userId, { name: dto.name });
    return brand;
  }

  async remove(id: number, userId: number) {
    await this.prisma.brand.delete({ where: { id } });
    await this.audit.log('Brand', id, 'DELETE', userId, {});
  }
}
