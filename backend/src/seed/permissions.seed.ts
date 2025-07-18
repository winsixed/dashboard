import { PrismaService } from '../prisma.service';

export const permissions = [
  { code: 'view_logs', description: 'Просмотр логов активности' },
  { code: 'import_data', description: 'Импорт данных' },
  { code: 'export_data', description: 'Экспорт данных' },
  { code: 'delete_flavor', description: 'Удаление вкусов' },
  { code: 'manage_users', description: 'Управление пользователями' },
  { code: 'manage_roles', description: 'Управление ролями' },
  { code: 'view_requests', description: 'Просмотр заявок' },
  { code: 'approve_requests', description: 'Подтверждение заявок' },
];

export async function run() {
  const prisma = new PrismaService();
  await prisma.$connect();

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  await prisma.$disconnect();
}
