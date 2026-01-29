import { IsString, MinLength, MaxLength, IsNotEmpty } from "class-validator";

/**
 * 팀 생성 요청 DTO
 */
export class CreateTeamRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  teamName: string;
}
