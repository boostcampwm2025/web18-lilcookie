import type { Request } from "express";
import { z } from "zod";

/**
 * OIDC 액세스 토큰 페이로드 스키마 (Zod validation)
 */
export const OidcAccessTokenPayloadSchema = z.object({
  sub: z.string(),
  iss: z.string(),
  aud: z.union([z.string(), z.array(z.string())]).transform((v) => (Array.isArray(v) ? v[0] : v)),
  exp: z.number(),
  iat: z.number(),
  auth_time: z.number().optional(),
  acr: z.string().optional(),
  amr: z.array(z.string()).optional(),
  sid: z.string().optional(),
  jti: z.string().optional(),
  email: z.string().optional(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  preferred_username: z.string().optional(),
  nickname: z.string().optional(),
  groups: z.array(z.string()).optional(),
  azp: z.string().optional(),
  uid: z.string().optional(),
  scope: z.string(),
});

export type OidcAccessTokenPayload = z.infer<typeof OidcAccessTokenPayloadSchema>;

export type AuthenticatedUser = OidcAccessTokenPayload & {
  userId: number;
  userUuid: string;
  userNickname: string;
};

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * JWK with required kid field
 */
export interface JWKWithKid {
  kty: string;
  kid: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  [key: string]: unknown;
}

/**
 * JWKS 응답 타입
 */
export interface JWKSResponse {
  keys: JWKWithKid[];
}
