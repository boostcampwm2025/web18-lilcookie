import { z } from "zod";
import {
  TokenResponseSchema,
  AuthTokensSchema,
  UserInfoSchema,
  AuthStateSchema,
  JwtBasicPayloadSchema,
} from "./auth.schema";

export type { TeamResponseData as Team } from "@repo/api";
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;
export type JwtBasicPayload = z.infer<typeof JwtBasicPayloadSchema>;
