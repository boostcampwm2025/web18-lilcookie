import { IsString, IsNotEmpty } from "class-validator";

export class UpdateFolderRequestDto {
  @IsString()
  @IsNotEmpty()
  folderName: string; // 수정할 폴더 이름
}
