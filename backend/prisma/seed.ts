import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
  const managerRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'manager',
    },
  });

  await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'staff',
    },
  });

  const permissionCodes = [
    'view_logs',
    'import_data',
    'export_data',
    'delete_flavor',
    'manage_users',
  ];

  const permissions = [] as { id: number }[];
  for (const code of permissionCodes) {
    const perm = await prisma.permission.upsert({
      where: { code },
      update: { description: code },
      create: { code, description: code },
    });
    permissions.push({ id: perm.id });
  }

  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: { id: perm.id },
      update: {},
      create: { id: perm.id, roleId: managerRole.id, permissionId: perm.id },
    });
  }

  const passwordHash = bcrypt.hashSync('123456', saltRounds);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      firstName: 'Admin',
      lastName: 'User',
      roleId: managerRole.id,
      passwordHash,
    },
    create: {
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      passwordHash,
      roleId: managerRole.id,
    },
  });

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
