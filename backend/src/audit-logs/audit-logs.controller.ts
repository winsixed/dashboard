import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';

@Controller('audit-logs')
@UseGuards(AuthGuard, PermissionsGuard)
export class AuditLogsController {
  constructor(private audit: AuditService) {}

  @Get()
  @Permission('view_logs')
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.audit.paginate(page, pageSize);
  }
}
