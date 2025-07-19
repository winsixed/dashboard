import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from './audit-logs.service';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, PrismaService],
})
export class AuditLogsModule {}
