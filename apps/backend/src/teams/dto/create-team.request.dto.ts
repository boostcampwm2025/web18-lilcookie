import { IsString, MinLength, MaxLength, IsNotEmpty } from "class-validator";

export class CreateTeamRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;
}
