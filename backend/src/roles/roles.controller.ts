import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';
import { User } from '../auth/user.decorator';

@Controller('roles')
export class RolesController {
  constructor(private roles: RolesService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('manage_roles')
  list() {
    return this.roles.list();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('manage_roles')
  create(@Body() dto: CreateRoleDto, @User() user) {
    return this.roles.create(dto, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('manage_roles')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user) {
    await this.roles.remove(id, user.id);
    return { success: true };
  }

  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('manage_roles')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @User() user,
  ) {
    return this.roles.update(id, dto, user.id);
  }
}
