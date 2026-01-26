import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetLinksQueryDto {
  @IsOptional()
  @IsNumber()
  teamId?: number;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  createdAfter?: string;
}
