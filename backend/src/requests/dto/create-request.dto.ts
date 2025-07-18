import { IsInt } from 'class-validator';

export class CreateRequestDto {
  @IsInt()
  flavorId: number;

  @IsInt()
  quantity: number;
}
