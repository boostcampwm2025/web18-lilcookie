import { IsOptional, IsString } from "class-validator";

export class GetLinksQueryDto {
  @IsOptional()
  @IsString()
  teamUuid?: string;

  @IsOptional()
  @IsString()
  folderUuid?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  createdAfter?: string;
}
