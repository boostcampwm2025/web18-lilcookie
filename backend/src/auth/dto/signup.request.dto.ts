import { Equals, IsBoolean, IsEmail, IsNotEmpty, IsString, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class AgreementsDto {
  @IsBoolean()
  @Equals(true, { message: "서비스 이용약관 동의는 필수입니다." })
  termsOfService: boolean;

  @IsBoolean()
  @Equals(true, { message: "개인정보 처리방침 동의는 필수입니다." })
  privacyPolicy: boolean;

  @IsBoolean()
  marketingConsent: boolean;
}

export class SignupRequestDto {
  @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다." })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9!@#$%^&*]{8,32}$/, {
    message: "비밀번호는 8~32자 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.",
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[가-힣a-zA-Z0-9]{2,12}$/, { message: "닉네임은 2~12자 한글, 영문, 숫자만 사용할 수 있습니다." })
  nickname: string;

  @ValidateNested()
  @Type(() => AgreementsDto)
  @IsNotEmpty()
  agreements: AgreementsDto;
}
