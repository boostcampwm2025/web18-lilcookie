import { IsString, IsNotEmpty } from "class-validator";

/**
 * 폴더 수정 요청 DTO
 */
export class UpdateFolderRequestDto {
  @IsString()
  @IsNotEmpty()
  folderName: string;
}
