import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ExportController],
  providers: [PrismaService],
})
export class ExportModule {}
