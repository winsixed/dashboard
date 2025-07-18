import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';

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
    await this.audit.log('Role', role.id, 'CREATE', userId, { name: dto.name });
    return role;
  }

  async remove(id: number, userId: number) {
    await this.prisma.role.delete({ where: { id } });
    await this.audit.log('Role', id, 'DELETE', userId, {});
  }

  async updatePermissions(roleId: number, codes: string[], userId: number) {
    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: codes } },
      select: { id: true },
    });

    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    if (permissions.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissions.map(p => ({ roleId, permissionId: p.id })),
      });
    }

    await this.audit.log('Role', roleId, 'UPDATE', userId, { permissions: codes });
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
  }
}
