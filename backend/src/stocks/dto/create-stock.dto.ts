import { IsInt } from 'class-validator';

export class CreateStockDto {
  @IsInt()
  flavorId: number;

  @IsInt()
  quantity: number;
}
