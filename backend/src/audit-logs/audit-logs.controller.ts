import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('audit-logs')
@UseGuards(AuthGuard, PermissionsGuard)
export class AuditLogsController {
  constructor(private logs: AuditLogsService) {}

  @Get()
  @Permission('view_logs')
  list(
    @Query('entity') entity?: string,
    @Query('userId', ParseIntPipe) userId?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset = 0,
  ) {
    return this.logs.list(entity, userId, limit, offset);
  }
}
