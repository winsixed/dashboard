import { IsInt, IsOptional } from 'class-validator';

export class UpdateStockDto {
  @IsInt()
  @IsOptional()
  flavorId?: number;

  @IsInt()
  @IsOptional()
  quantity?: number;
}
