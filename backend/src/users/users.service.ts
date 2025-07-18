import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: { select: { id: true, name: true } },
        permissions: {
          include: { permission: { select: { code: true } } },
        },
      },
    });
    return users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      role: u.role,
      permissions: u.permissions.map(p => p.permission),
    }));
  }

  async create(dto: CreateUserDto, userId: number) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: dto.username,
        passwordHash,
        roleId: dto.roleId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: { select: { id: true, name: true } },
      },
    });
    await this.audit.log('User', user.id, 'CREATE', userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
      roleId: dto.roleId,
    });
    return user;
  }

  async remove(id: number, userId: number) {
    await this.prisma.user.delete({ where: { id } });
    await this.audit.log('User', id, 'DELETE', userId, {});
  }
}
