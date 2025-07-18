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
  ],
  providers: [],
})
export class AppModule {}
