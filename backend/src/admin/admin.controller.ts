import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { ExportService } from './export.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';

@Controller()
export class AdminController {
  constructor(
    private importService: ImportService,
    private exportService: ExportService,
  ) {}

  @Post('admin/import')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('import_data')
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Body('entityType') entityType: string,
    @Req() req,
  ) {
    if (!file) throw new BadRequestException('File required');
    if (!['flavors', 'stocks'].includes(entityType)) {
      throw new BadRequestException('Invalid entityType');
    }
    return this.importService.createJob(file, entityType, req.user.id);
  }

  @Get('admin/import/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('import_data')
  getJob(@Param('id', ParseIntPipe) id: number) {
    return this.importService.getJob(id);
  }

  @Get('export/flavors.xlsx')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('export_data')
  async exportFlavors(@Res() res) {
    const buffer = await this.exportService.flavorsXlsx();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="flavors.xlsx"');
    res.send(buffer);
  }

  @Get('export/stocks.csv')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('export_data')
  async exportStocks(@Res() res) {
    const csv = await this.exportService.stocksCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="stocks.csv"');
    res.send(csv);
  }
}
