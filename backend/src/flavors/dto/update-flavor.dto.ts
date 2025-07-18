import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateFlavorDto {
  @IsInt()
  @IsOptional()
  brandId?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  profile?: string;
}
