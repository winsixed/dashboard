import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async list() {
    const roles = await this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
    return roles.map(r => ({
      id: r.id,
      name: r.name,
      permissions: r.permissions.map(rp => rp.permission),
    }));
  }

  async create(dto: CreateRoleDto, userId: number) {
    const role = await this.prisma.role.create({ data: { name: dto.name } });

    if (dto.permissions && dto.permissions.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { code: { in: dto.permissions } },
        select: { id: true },
      });
      if (permissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: permissions.map(p => ({ roleId: role.id, permissionId: p.id })),
        });
      }
    }

    const result = await this.prisma.role.findUnique({
      where: { id: role.id },
      include: { permissions: { include: { permission: true } } },
    });

    await this.audit.log('Role', role.id, 'CREATE', userId, {
      name: dto.name,
      permissions: dto.permissions,
    });

    return {
      id: result.id,
      name: result.name,
      permissions: result.permissions.map(rp => rp.permission),
    };
  }

  async remove(id: number, userId: number) {
    const count = await this.prisma.user.count({ where: { roleId: id } });
    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete a role that is assigned to users',
      );
    }

    await this.prisma.role.delete({ where: { id } });
    await this.audit.log('Role', id, 'DELETE', userId, {});
  }

  async update(roleId: number, dto: UpdateRoleDto, userId: number) {
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;

    if (Object.keys(data).length > 0) {
      await this.prisma.role.update({ where: { id: roleId }, data });
    }

    if (dto.permissions) {
      const permissions = await this.prisma.permission.findMany({
        where: { code: { in: dto.permissions } },
        select: { id: true },
      });
      await this.prisma.rolePermission.deleteMany({ where: { roleId } });
      if (permissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: permissions.map(p => ({ roleId, permissionId: p.id })),
        });
      }
    }

    const result = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });

    const diff = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    await this.audit.log('Role', roleId, 'UPDATE', userId, diff);

    return {
      id: result.id,
      name: result.name,
      permissions: result.permissions.map(rp => rp.permission),
    };
  }
}
