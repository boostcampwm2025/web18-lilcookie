import { IsNotEmpty, IsString, IsArray, ArrayMinSize, Matches, MaxLength, IsUrl } from "class-validator";

/**
 * OAuth App 생성 요청 DTO
 */
export class CreateOAuthAppRequestDto {
  @IsNotEmpty({ message: "앱 이름은 필수입니다." })
  @IsString()
  @MaxLength(100, { message: "앱 이름은 100자를 초과할 수 없습니다." })
  @Matches(/^[a-zA-Z0-9가-힣\s\-_]+$/, {
    message: "앱 이름은 영문, 숫자, 한글, 공백, 하이픈, 언더스코어만 사용할 수 있습니다.",
  })
  name: string;

  @IsArray({ message: "Redirect URIs는 배열이어야 합니다." })
  @ArrayMinSize(1, { message: "최소 1개의 Redirect URI가 필요합니다." })
  @IsUrl(
    { require_protocol: true, protocols: ["http", "https"], require_tld: false },
    { each: true, message: "각 Redirect URI는 유효한 URL이어야 합니다." },
  )
  redirectUris: string[];
}
