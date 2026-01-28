import { IsString, IsNotEmpty } from "class-validator";

export class CreateFolderRequestDto {
  @IsString()
  @IsNotEmpty()
  teamUuid: string; // 팀 ID

  @IsString()
  @IsNotEmpty()
  folderName: string; // 폴더 이름
}
