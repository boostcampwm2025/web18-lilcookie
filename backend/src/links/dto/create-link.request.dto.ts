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
  tags: string[];

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsNumber()
  @IsOptional() // 폴더는 선택사항
  folderId?: number; // 폴더 ID (없으면 null)
}
