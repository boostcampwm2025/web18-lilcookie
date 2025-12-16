import { IsOptional, IsString } from "class-validator";

export class GetLinksQueryDto {
  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}
