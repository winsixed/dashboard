import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { FlavorsModule } from './flavors/flavors.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, BrandsModule, FlavorsModule, AdminModule],
  providers: [],
})
export class AppModule {}
