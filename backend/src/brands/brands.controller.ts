import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private brands: BrandsService) {}

  @Get()
  list() {
    return this.brands.list();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('import_data')
  create(@Body() dto: CreateBrandDto, @Req() req) {
    return this.brands.create(dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('delete_flavor')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.brands.remove(id, req.user.id);
    return { success: true };
  }
}
