import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list() {
    return this.prisma.stock.findMany({
      include: { flavor: { select: { name: true } } },
    });
  }

  async create(dto: CreateStockDto, userId: number) {
    const stock = await this.prisma.stock.create({ data: dto });
    await this.audit.log('Stock', stock.id, 'CREATE', userId, dto);
    return stock;
  }

  async update(id: number, dto: UpdateStockDto, userId: number) {
    const stock = await this.prisma.stock.update({ where: { id }, data: dto });
    const diff = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    await this.audit.log('Stock', id, 'UPDATE', userId, diff);
    return stock;
  }

  async remove(id: number, userId: number) {
    await this.prisma.stock.delete({ where: { id } });
    await this.audit.log('Stock', id, 'DELETE', userId, {});
  }
}
