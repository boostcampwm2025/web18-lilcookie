import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateFolderRequestDto {
  @IsString()
  @IsNotEmpty()
  teamId: string; // 팀 ID

  @IsString()
  @IsNotEmpty()
  folderName: string; // 폴더 이름

  @IsString()
  @IsOptional() // 선택적 (최상위 폴더면 null)
  parentFolderId?: string; // 부모 폴더 ID

  @IsString()
  @IsNotEmpty()
  userId: string; // 생성하는 사용자 ID
}
