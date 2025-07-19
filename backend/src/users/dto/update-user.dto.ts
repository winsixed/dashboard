import { ArrayUnique, IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsInt()
  @IsOptional()
  roleId?: number;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}
