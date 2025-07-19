import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';
import * as xlsx from 'xlsx';

@Controller('export')
@UseGuards(AuthGuard, PermissionsGuard)
export class ExportController {
  constructor(private prisma: PrismaService) {}

  @Get('flavors')
  @Permission('export_data')
  async exportFlavors(@Res() res) {
    const flavors = await this.prisma.flavor.findMany({
      include: { brand: { select: { name: true } } },
    });
    const data = flavors.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description ?? '',
      profile: f.profile ?? '',
      brand: f.brand.name,
    }));
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Flavors');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="flavors.xlsx"');
    res.send(buffer);
  }
}
