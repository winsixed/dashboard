import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { FlavorsModule } from './flavors/flavors.module';

@Module({
  imports: [AuthModule, BrandsModule, FlavorsModule],
  providers: [],
})
export class AppModule {}
