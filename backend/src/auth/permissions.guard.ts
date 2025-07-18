import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import { PERMISSIONS_KEY } from './permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException();
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId: user.roleId },
      include: { permission: true },
    });

    const userPermissions = await this.prisma.userPermission.findMany({
      where: { userId: user.id },
      include: { permission: true },
    });

    const codes = new Set<string>([
      ...rolePermissions.map(rp => rp.permission.code),
      ...userPermissions.map(up => up.permission.code),
    ]);

    const allowed = required.every(p => codes.has(p));
    if (!allowed) {
      throw new ForbiddenException();
    }

    return true;
  }
}
