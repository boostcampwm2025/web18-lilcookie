import type { Request } from "express";
import { z } from "zod";

export const OidcAccessTokenPayloadSchema = z.object({
  sub: z.string(),
  iss: z.string(),
  aud: z.union([z.string(), z.array(z.string())]).transform((v) => (Array.isArray(v) ? v[0] : v)),
  exp: z.number(),
  iat: z.number(),
  jti: z.string().optional(),
  team_id: z.string(),
  roles: z.array(z.string()),
  scope: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
});

export type OidcAccessTokenPayload = z.infer<typeof OidcAccessTokenPayloadSchema>;

export interface AuthenticatedRequest extends Request {
  user: OidcAccessTokenPayload;
}
