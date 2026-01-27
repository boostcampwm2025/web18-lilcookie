import { IsString, IsArray, IsNotEmpty, IsUrl, IsOptional } from "class-validator";

export class CreateLinkRequestDto {
  @IsString()
  @IsNotEmpty()
  teamUuid: string;

  @IsOptional()
  @IsString()
  folderUuid?: string;

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
}
