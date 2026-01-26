import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateFolderRequestDto {
  @IsNumber()
  @IsNotEmpty()
  teamId: number; // 팀 ID

  @IsString()
  @IsNotEmpty()
  folderName: string; // 폴더 이름

  @IsNumber()
  @IsNotEmpty()
  userId: number; // 생성하는 사용자 ID
}
