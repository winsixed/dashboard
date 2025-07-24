import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateFlavorDto } from './dto/create-flavor.dto';
import { UpdateFlavorDto } from './dto/update-flavor.dto';

@Injectable()
export class FlavorsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(brandId?: number, profile?: string, sort?: string) {
    const where: Prisma.FlavorWhereInput = {};
    if (brandId) where.brandId = brandId;
    if (profile) where.profile = profile;

    const orderBy: Prisma.FlavorOrderByWithRelationInput[] = [];
    if (sort === 'name_asc') orderBy.push({ name: 'asc' });
    if (sort === 'name_desc') orderBy.push({ name: 'desc' });

    return this.prisma.flavor.findMany({
      where,
      include: { brand: { select: { name: true } } },
      orderBy: orderBy.length > 0 ? orderBy : undefined,
    });
  }

  async create(dto: CreateFlavorDto, userId: number) {
    const flavor = await this.prisma.flavor.create({ data: dto });
    await this.audit.log('Flavor', flavor.id, 'CREATE', userId, dto);
    return flavor;
  }

  async update(id: number, dto: UpdateFlavorDto, userId: number) {
    const flavor = await this.prisma.flavor.update({ where: { id }, data: dto });
    const diff = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    await this.audit.log('Flavor', id, 'UPDATE', userId, diff);
    return flavor;
  }

  async remove(id: number, userId: number) {
    await this.prisma.flavor.delete({ where: { id } });
    await this.audit.log('Flavor', id, 'DELETE', userId, {});
  }
}
