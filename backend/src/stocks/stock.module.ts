import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [StockController],
  providers: [StockService, PrismaService, AuditService],
})
export class StockModule {}
