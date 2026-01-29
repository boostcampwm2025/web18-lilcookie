import { IsUrl, IsNotEmpty } from "class-validator";

/**
 * 웹훅 생성 요청 DTO
 */
export class CreateWebhookRequestDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
