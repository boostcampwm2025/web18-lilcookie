import { z } from "zod";

/** 팀 생성 요청 */
export const CreateTeamRequestSchema = z.object({
  teamName: z.string().min(1),
});

/** 팀 공통 응답 data */
export const TeamResponseDataSchema = z.object({
  teamUuid: z.string().uuid(),
  teamName: z.string(),
  createdAt: z.string().datetime(),
  role: z.enum(["admin", "member"]),
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
  role: z.enum(["admin", "member"]),
});

/** 팀 멤버 조회 응답 */
export const GetTeamMembersResponsdDataSchema = z.object({
  userUuid: z.string().uuid(),
  userName: z.string(),
  role: z.enum(["admin", "member"]),
  joinedAt: z.string().datetime(),
});
