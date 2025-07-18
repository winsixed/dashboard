import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AdminController } from './admin.controller';
import { ImportService } from './import.service';
import { ExportService } from './export.service';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Module({
  imports: [MulterModule.register({ dest: 'uploads' })],
  controllers: [AdminController],
  providers: [ImportService, ExportService, PrismaService, AuditService],
})
export class AdminModule {}
