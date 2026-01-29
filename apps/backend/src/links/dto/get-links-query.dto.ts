import { IsDate, IsOptional, IsString, IsUUID } from "class-validator";
import { Type } from "class-transformer";

/**
 * 링크 조회 쿼리 DTO
 */
export class GetLinksQueryDto {
  @IsOptional()
  @IsUUID()
  teamUuid?: string;

  @IsOptional()
  @IsUUID()
  folderUuid?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAfter?: Date;
}
