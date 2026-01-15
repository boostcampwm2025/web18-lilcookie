import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class LoginRequestDto {
  @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다." })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9!@#$%^&*]{8,32}$/, {
    message: "비밀번호는 8~32자 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.",
  })
  password: string;
}
