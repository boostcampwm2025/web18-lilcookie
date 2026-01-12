import { IsString, IsArray, IsNotEmpty, IsUrl, IsOptional } from "class-validator";

export class CreateLinkRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  teamId: string;

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

  @IsString()
  @IsOptional() // 폴더는 선택사항
  folderId?: string; // 폴더 ID (없으면 null)
}
