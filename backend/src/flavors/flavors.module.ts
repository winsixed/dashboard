import { Module } from '@nestjs/common';
import { FlavorsController } from './flavors.controller';
import { FlavorsService } from './flavors.service';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [FlavorsController],
  providers: [FlavorsService, PrismaService, AuditService],
})
export class FlavorsModule {}
