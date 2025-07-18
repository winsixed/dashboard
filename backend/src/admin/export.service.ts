import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as xlsx from 'xlsx';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async flavorsXlsx(): Promise<Buffer> {
    const flavors = await this.prisma.flavor.findMany();
    const data = flavors.map(f => ({
      id: f.id,
      brandId: f.brandId,
      name: f.name,
      description: f.description ?? '',
      profile: f.profile ?? '',
    }));
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Flavors');
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async stocksCsv(): Promise<string> {
    const stocks = await this.prisma.stock.findMany();
    const header = 'id,flavorId,quantity';
    const lines = stocks.map(s => `${s.id},${s.flavorId},${s.quantity}`);
    return [header, ...lines].join('\n');
  }
}
