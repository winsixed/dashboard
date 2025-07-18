import { Controller, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('audit')
@UseGuards(AuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @Permission('view_logs')
  list(
    @Query('model') model?: string,
    @Query('action') action?: string,
    @Query('userId', ParseIntPipe) userId?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.audit.list({
      model,
      action,
      userId: userId ? Number(userId) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }
}
