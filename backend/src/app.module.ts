import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { FlavorsModule } from './flavors/flavors.module';
import { AdminModule } from './admin/admin.module';
import { StockModule } from './stocks/stock.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { RolesModule } from './roles/roles.module';
import { RequestsModule } from './requests/requests.module';
import { ImportModule } from './import/import.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ExportModule } from './export/export.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    AuthModule,
    BrandsModule,
    FlavorsModule,
    AdminModule,
    StockModule,
    UsersModule,
    RolesModule,
    RequestsModule,
    AuditModule,
    AuditLogsModule,
    ImportModule,
    ExportModule,
    DashboardModule,
  ],
  providers: [],
})
export class AppModule {}
