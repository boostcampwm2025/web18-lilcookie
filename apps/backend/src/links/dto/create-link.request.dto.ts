import { IsString, IsArray, IsNotEmpty, IsUrl, IsOptional, IsUUID } from "class-validator";

/**
 * 링크 생성 요청 DTO
 */
export class CreateLinkRequestDto {
  @IsUUID()
  @IsNotEmpty()
  teamUuid: string;

  @IsOptional()
  @IsUUID()
  folderUuid?: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  // 빈 배열 허용?
  // @ArrayMinSize(1)
  // 확장 프로그램에서는 태그를 필수로 입력하게 되어 있음.
  tags: string[];

  @IsString()
  @IsNotEmpty()
  summary: string;
}
