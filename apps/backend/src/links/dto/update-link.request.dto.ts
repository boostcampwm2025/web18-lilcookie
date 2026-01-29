import { IsString, IsArray, IsUrl, IsOptional, IsUUID } from "class-validator";

/**
 * 링크 수정 요청 DTO
 * 모든 필드는 덮어쓰기로 처리되며, 전부 옵셔널
 */
export class UpdateLinkRequestDto {
  @IsOptional()
  @IsUUID()
  teamUuid?: string;

  @IsOptional()
  @IsUUID()
  folderUuid?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  summary?: string;
}
