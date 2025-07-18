import { BadRequestException, Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';
import { stringify } from 'csv-stringify/sync';
import * as xlsx from 'xlsx';

@Controller('export')
@UseGuards(AuthGuard, PermissionsGuard)
@Permission('export_data')
export class ExportController {
  constructor(private prisma: PrismaService) {}

  @Get('flavors')
  async exportFlavors(@Query('format') format = 'csv', @Res() res) {
    if (format !== 'csv' && format !== 'xlsx') {
      throw new BadRequestException('Invalid format');
    }

    const flavors = await this.prisma.flavor.findMany({
      include: { brand: { select: { name: true } } },
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="flavors.${format}"`);

    if (format === 'csv') {
      const records = flavors.map(f => ({
        id: f.id,
        brand: f.brand.name,
        name: f.name,
        description: f.description ?? '',
        profile: f.profile ?? '',
      }));
      const csv = stringify(records, { header: true });
      res.send(csv);
    } else {
      const data = flavors.map(f => ({
        id: f.id,
        brand: f.brand.name,
        name: f.name,
        description: f.description ?? '',
        profile: f.profile ?? '',
      }));
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Flavors');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);
    }
  }
}
