import { Injectable } from '@nestjs/common';
import { ImportJob } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { Express } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as xlsx from 'xlsx';

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService, private audit: AuditService) {
    setInterval(() => this.processPendingJobs(), 15000);
  }

  async createJob(file: Express.Multer.File, entityType: string, userId: number) {
    const filename = `${Date.now()}_${file.originalname}`;
    await fs.mkdir('uploads', { recursive: true });
    await fs.writeFile(path.join('uploads', filename), file.buffer);
    return this.prisma.importJob.create({
      data: { entityType, filename, uploadedById: userId, status: 'pending' },
    });
  }

  getJob(id: number) {
    return this.prisma.importJob.findUnique({ where: { id } });
  }

  private async processPendingJobs() {
    const jobs = await this.prisma.importJob.findMany({ where: { status: 'pending' } });
    for (const job of jobs) {
      const errors = await this.handleJob(job).catch(e => [e.message]);
      await this.prisma.importJob.update({
        where: { id: job.id },
        data: { status: errors.length ? 'failed' : 'completed', errors },
      });
    }
  }

  private async handleJob(job: ImportJob): Promise<string[]> {
    const filePath = path.join('uploads', job.filename);
    let rows: any[] = [];
    if (filePath.endsWith('.csv')) {
      const content = await fs.readFile(filePath, 'utf8');
      rows = parse(content, { columns: true, skip_empty_lines: true });
    } else {
      const wb = xlsx.readFile(filePath);
      rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    }
    const errors: string[] = [];
    if (job.entityType === 'flavors') {
      for (const r of rows) {
        try {
          const data = {
            brandId: Number(r.brandId),
            name: String(r.name),
            description: r.description || undefined,
            profile: r.profile || undefined,
          };
          await this.prisma.flavor.upsert({
            where: { id: Number(r.id) || 0 },
            update: data,
            create: { id: r.id ? Number(r.id) : undefined, ...data },
          });
          await this.audit.log('Flavor', Number(r.id), 'CREATE', job.uploadedById, data);
        } catch (e) {
          errors.push(`Row ${JSON.stringify(r)}: ${e.message}`);
        }
      }
    } else if (job.entityType === 'stocks') {
      for (const r of rows) {
        try {
          const data = {
            flavorId: Number(r.flavorId),
            quantity: Number(r.quantity),
          };
          await this.prisma.stock.upsert({
            where: { id: Number(r.id) || 0 },
            update: data,
            create: { id: r.id ? Number(r.id) : undefined, ...data },
          });
          await this.audit.log('Stock', Number(r.id), 'CREATE', job.uploadedById, data);
        } catch (e) {
          errors.push(`Row ${JSON.stringify(r)}: ${e.message}`);
        }
      }
    }
    return errors;
  }
}
