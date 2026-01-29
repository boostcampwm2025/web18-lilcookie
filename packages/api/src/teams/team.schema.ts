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

export const JoinTeamResponseDataSchema = z.object({
  teamUuid: z.uuid(),
  teamName: z.string(),
  joinedAt: z.iso.datetime(),
  role: RoleSchema,
});

export const GetTeamMembersResponsedDataSchema = z.object({
  userUuid: z.uuid(),
  userName: z.string(),
  role: RoleSchema,
  joinedAt: z.iso.datetime(),
});
