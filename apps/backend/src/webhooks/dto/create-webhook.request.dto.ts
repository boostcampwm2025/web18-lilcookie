import { IsUrl, IsNotEmpty, Matches } from "class-validator";

/**
 * 웹훅 생성 요청 DTO
 */
export class CreateWebhookRequestDto {
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  @Matches(/^https?:\/\//, {
    message: "http/https만 허용됩니다.",
  })
  @Matches(/^(?!.*(?:localhost|127\.0\.0\.1|\[::1\]))/i, { message: "로컬 주소는 허용되지 않습니다." })
  url: string;
}
