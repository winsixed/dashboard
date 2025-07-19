import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
    });

    if (dto.permissions && dto.permissions.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { code: { in: dto.permissions } },
        select: { id: true },
      });
      if (permissions.length > 0) {
        await this.prisma.userPermission.createMany({
          data: permissions.map(p => ({ userId: user.id, permissionId: p.id })),
        });
      }
    }

    const result = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: { select: { id: true, name: true } },
        permissions: { include: { permission: { select: { code: true } } } },
      },
    });
    await this.audit.log('User', user.id, 'CREATE', userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
      roleId: dto.roleId,
      permissions: dto.permissions,
    });
    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      username: result.username,
      role: result.role,
      permissions: result.permissions.map(p => p.permission),
    };
  }

  async update(id: number, dto: UpdateUserDto, userId: number) {
    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.roleId !== undefined) data.roleId = dto.roleId;

    if (Object.keys(data).length > 0) {
      await this.prisma.user.update({ where: { id }, data });
    }

    if (dto.permissions) {
      const permissions = await this.prisma.permission.findMany({
        where: { code: { in: dto.permissions } },
        select: { id: true },
      });
      await this.prisma.userPermission.deleteMany({ where: { userId: id } });
      if (permissions.length > 0) {
        await this.prisma.userPermission.createMany({
          data: permissions.map(p => ({ userId: id, permissionId: p.id })),
        });
      }
    }

    const result = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: { select: { id: true, name: true } },
        permissions: { include: { permission: { select: { code: true } } } },
      },
    });

    const diff = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    await this.audit.log('User', id, 'UPDATE', userId, diff);

    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      username: result.username,
      role: result.role,
      permissions: result.permissions.map(p => p.permission),
    };
  }

  async remove(id: number, userId: number) {
    await this.prisma.user.delete({ where: { id } });
    await this.audit.log('User', id, 'DELETE', userId, {});
  }
}
