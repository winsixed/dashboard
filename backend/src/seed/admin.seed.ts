import { PrismaService } from '../prisma.service';
import { run as seedPermissions } from './permissions.seed';
import * as bcrypt from 'bcryptjs';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();

  // ensure permissions are seeded
  await seedPermissions();

  // find or create admin role
  let adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({ data: { name: 'Admin' } });
  }

  // assign all permissions to admin role
  const perms = await prisma.permission.findMany();
  for (const perm of perms) {
    const existing = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: perm.id },
    });
    if (!existing) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: perm.id },
      });
    }
  }

  // create default admin user if not exists
  let adminUser = await prisma.user.findFirst({ where: { username: 'admin' } });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    adminUser = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Admin',
        username: 'admin',
        passwordHash,
        roleId: adminRole.id,
      },
    });
  }

  // assign all permissions to admin user
  for (const perm of perms) {
    const existing = await prisma.userPermission.findFirst({
      where: { userId: adminUser.id, permissionId: perm.id },
    });
    if (!existing) {
      await prisma.userPermission.create({
        data: { userId: adminUser.id, permissionId: perm.id },
      });
    }
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
});
