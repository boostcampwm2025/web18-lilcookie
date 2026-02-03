import { z } from "zod";
import { RoleSchema, TeamBaseSchema } from "../common/common.schema.js";

/** 팀 생성 요청 */
export const CreateTeamRequestSchema = z.object({
  teamName: z.string().min(1),
});

/** 팀 공통 응답 data */
export const TeamResponseDataSchema = TeamBaseSchema.extend({
  role: RoleSchema,
});

/** 초대 링크용 응답 */
export const PreviewTeamRespondDataSchema = z.object({
  teamName: z.string(),
});

/** 팀 가입 응답 data */
export const JoinTeamResponseDataSchema = z.object({
  teamUuid: z.string().uuid(),
  teamName: z.string(),
  joinedAt: z.string().datetime(),
  role: RoleSchema,
});

/** 팀 멤버 조회 응답 */
export const GetTeamMembersResponsedDataSchema = z.object({
  userUuid: z.string().uuid(),
  userName: z.string(),
  userEmail: z.string(),
  role: RoleSchema,
  joinedAt: z.string().datetime(),
});

/** 웹훅 공통 응답 data */
export const GetTeamWebhooksResponseDataSchema = z.object({
  webhookUuid: z.string().uuid(),
  url: z.string(),
  isActive: z.boolean(),
});

/** 토큰 사용량 응답 data */
export const GetTeamTokenUsageResponseDataSchema = z.object({
  usedTokens: z.number(),
  maxTokens: z.number(),
  percentage: z.number(),
});

/** 권한 위임 요청 */
export const TransferOwnershipRequestSchema = z.object({
  targetUserUuid: z.string().uuid(),
});
