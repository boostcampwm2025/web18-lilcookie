import { IsString, IsNotEmpty, IsUUID } from "class-validator";

/**
 * 폴더 생성 요청 DTO
 */
export class CreateFolderRequestDto {
  @IsUUID()
  @IsNotEmpty()
  teamUuid: string;

  @IsString()
  @IsNotEmpty()
  folderName: string;
}
