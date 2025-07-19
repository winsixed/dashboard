import { IsArray, IsInt, IsOptional, IsString, ArrayNotEmpty } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsOptional()
  comment?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  flavorIds: number[];
}
