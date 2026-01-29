import type { Request } from "express";
import { z } from "zod";

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
  roles: z.array(z.string()),
  team_id: z.string().nullable(),
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
