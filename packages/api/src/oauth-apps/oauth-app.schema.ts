import { z } from "zod";

/** OAuth App 생성 요청 */
export const CreateOAuthAppRequestSchema = z.object({
  name: z.string().min(1, "앱 이름은 필수입니다"),
  redirectUris: z.array(z.string().url("유효한 URL 형식이어야 합니다")).min(1, "최소 하나의 Redirect URI가 필요합니다"),
});

/** OAuth App 응답 (Client Secret 제외) */
export const OAuthAppResponseDataSchema = z.object({
  oauthAppUuid: z.string().uuid(),
  name: z.string(),
  clientId: z.string(),
  redirectUris: z.array(z.string()),
  scopes: z.string(),
  createdAt: z.string().datetime(),
});

/** OAuth App 생성 응답 (Client Secret 포함 - 생성 시에만) */
export const OAuthAppCreatedResponseDataSchema = OAuthAppResponseDataSchema.extend({
  clientSecret: z.string(),
});
