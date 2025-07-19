import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditService, PrismaService],
})
export class AuditLogsModule {}
