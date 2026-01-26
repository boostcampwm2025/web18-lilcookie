import { Type } from "class-transformer";
import { IsString, IsArray, IsNotEmpty, IsUrl, IsOptional, IsNumber } from "class-validator";

export class CreateLinkRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  teamId: number;

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

  @IsNumber()
  @IsOptional() // 폴더는 선택사항
  folderId?: number; // 폴더 ID (없으면 null)
}
