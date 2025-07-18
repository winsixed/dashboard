import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../auth/permission.decorator';
import { User } from '../auth/user.decorator';
import { Express } from 'express';

@Controller('import-jobs')
@UseGuards(AuthGuard, PermissionsGuard)
@Permission('import_data')
export class ImportController {
  constructor(private imports: ImportService) {}

  @Get()
  list() {
    return this.imports.listJobs();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body('entityType') entityType: string,
    @User() user,
  ) {
    return this.imports.createJob(file, entityType, user.id);
  }

  @Get(':id/errors')
  getErrors(@Param('id', ParseIntPipe) id: number) {
    return this.imports.getErrors(id);
  }
}
