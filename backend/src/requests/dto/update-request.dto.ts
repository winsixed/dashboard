import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum RequestStatusEnum {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export class UpdateRequestDto {
  @IsEnum(RequestStatusEnum)
  @IsOptional()
  status?: RequestStatusEnum;

  @IsString()
  @IsOptional()
  comment?: string;
}
