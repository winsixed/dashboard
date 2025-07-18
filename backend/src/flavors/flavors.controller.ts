import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { FlavorsService } from './flavors.service';
import { CreateFlavorDto } from './dto/create-flavor.dto';
import { UpdateFlavorDto } from './dto/update-flavor.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('flavors')
export class FlavorsController {
  constructor(private flavors: FlavorsService) {}

  @Get()
  list() {
    return this.flavors.list();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('import_data')
  create(@Body() dto: CreateFlavorDto, @Req() req) {
    return this.flavors.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('import_data')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlavorDto,
    @Req() req,
  ) {
    return this.flavors.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('delete_flavor')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.flavors.remove(id, req.user.id);
    return { success: true };
  }
}
