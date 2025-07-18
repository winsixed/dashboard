import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';
import { User } from '../auth/user.decorator';

@Controller('stocks')
export class StockController {
  constructor(private stocks: StockService) {}

  @Get()
  list() {
    return this.stocks.list();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('import_data')
  create(@Body() dto: CreateStockDto, @User() user) {
    return this.stocks.create(dto, user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('import_data')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockDto,
    @User() user,
  ) {
    return this.stocks.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permission('delete_flavor')
  async delete(@Param('id', ParseIntPipe) id: number, @User() user) {
    await this.stocks.remove(id, user.id);
    return { success: true };
  }
}
