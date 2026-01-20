import type { Request } from "express";

export interface OidcTokenPayload {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  jti?: string;
  team_id: string;
  roles: string[];
  scope: string;
  email?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user: OidcTokenPayload;
}
