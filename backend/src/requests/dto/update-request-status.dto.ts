import { IsString } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsString()
  status: string;
}
