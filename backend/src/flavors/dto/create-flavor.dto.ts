import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFlavorDto {
  @IsInt()
  brandId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  profile?: string;
}
