import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, PrismaService, AuditService],
})
export class BrandsModule {}
