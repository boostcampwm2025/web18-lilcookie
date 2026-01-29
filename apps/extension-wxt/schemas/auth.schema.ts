import { z } from "zod";
import { TeamResponseDataSchema } from "@repo/api";

/** OAuth token response from Authentik */
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
  scope: z.string(),
});

/** Stored auth tokens in chrome.storage */
export const AuthTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});

/** User info derived from JWT + API */
export const UserInfoSchema = z.object({
  userUuid: z.string(),
  nickname: z.string().optional(),
  teams: z.array(TeamResponseDataSchema),
  selectedTeamUuid: z.string(),
});

/** Auth state for UI consumption */
export const AuthStateSchema = z.object({
  isLoggedIn: z.boolean(),
  accessToken: z.string().optional(),
  userInfo: UserInfoSchema.optional(),
});

/** JWT payload (minimal - for extractBasicUserInfo) */
export const JwtBasicPayloadSchema = z
  .object({
    sub: z.string(),
    nickname: z.string().optional(),
  })
  .passthrough();

/** Chrome storage shape for auth_tokens */
export const StoredAuthTokensSchema = z.object({
  auth_tokens: AuthTokensSchema.optional(),
});

/** Chrome storage shape for selected_team_uuid */
export const StoredSelectedTeamSchema = z.object({
  selected_team_uuid: z.string().optional(),
});

/** API response wrapper for teams endpoint */
export const TeamsApiResponseSchema = z.object({
  data: z.array(TeamResponseDataSchema),
});
