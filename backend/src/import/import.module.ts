import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [MulterModule.register({ dest: 'uploads' })],
  controllers: [ImportController],
  providers: [ImportService, PrismaService],
})
export class ImportModule {}
