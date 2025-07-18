import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Express } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  listJobs() {
    return this.prisma.importJob.findMany({
      orderBy: { id: 'desc' },
      select: { id: true, filename: true, status: true, entityType: true },
    });
  }

  async createJob(file: Express.Multer.File, entityType: string, userId: number) {
    const filename = `${Date.now()}_${file.originalname}`;
    await fs.mkdir('uploads', { recursive: true });
    const filePath = path.join('uploads', filename);
    await fs.writeFile(filePath, file.buffer);
    const job = await this.prisma.importJob.create({
      data: { entityType, filename, uploadedById: userId, status: 'pending' },
    });

    const errors = await this.processFile(filePath, entityType);

    await this.prisma.importJob.update({
      where: { id: job.id },
      data: { status: errors.length ? 'error' : 'done', errors },
    });

    return { id: job.id, filename, status: errors.length ? 'error' : 'done' };
  }

  async getErrors(id: number) {
    const job = await this.prisma.importJob.findUnique({
      where: { id },
      select: { errors: true },
    });
    return job?.errors ?? [];
  }

  private async processFile(filePath: string, entityType: string): Promise<string[]> {
    const content = await fs.readFile(filePath, 'utf8');
    const rows = parse(content, { columns: true, skip_empty_lines: true });
    const errors: string[] = [];

    if (entityType === 'flavors') {
      for (const [index, r] of rows.entries()) {
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
        } catch (e: any) {
          errors.push(`Row ${index + 1}: ${e.message}`);
        }
      }
    }
    // Extend for other entity types as needed
    return errors;
  }
}
