import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';
import { User } from '../auth/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('manage_users')
  list() {
    return this.users.list();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('manage_users')
  create(@Body() dto: CreateUserDto, @User() user) {
    return this.users.create(dto, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('manage_users')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user) {
    await this.users.remove(id, user.id);
    return { success: true };
  }
}
