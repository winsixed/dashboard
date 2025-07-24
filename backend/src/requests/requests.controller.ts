import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards, Query } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';
import { User } from '../auth/user.decorator';

@Controller('requests')
export class RequestsController {
  constructor(private requests: RequestsService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('view_requests')
  list(
    @Query('status') status?: string,
    @Query('brandId') brandId?: string,
    @Query('sort') sort?: string,
  ) {
    return this.requests.list(
      status as any,
      brandId ? Number(brandId) : undefined,
      sort,
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateRequestDto, @User() user) {
    return this.requests.create(dto, user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('approve_requests')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestDto,
    @User() user,
  ) {
    return this.requests.update(id, dto, user.id);
  }
}
