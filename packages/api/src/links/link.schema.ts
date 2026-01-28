import { z } from "zod";

/** 링크 생성 요청 */
export const CreateLinkRequestSchema = z.object({
  teamUuid: z.string().uuid(),
  folderUuid: z.string().uuid().optional(),
  url: z.string(),
  title: z.string().min(1),
  tags: z.string().array().min(1),
  summary: z.string().min(1),
});

/** 링크 공통 응답 */
export const LinkResponseDataSchema = z.object({
  linkUuid: z.string().uuid(),
  teamUuid: z.string().uuid(),
  folderUuid: z.string().uuid(),
  url: z.string(),
  title: z.string(),
  tags: z.string().array(),
  summary: z.string(),
  createdAt: z.string().datetime(),
  createdBy: z.object({
    userUuid: z.string().uuid(),
    userName: z.string(),
  }),
});

/** 링크 수정 요청 */
export const PatchLinkRequestSchema = z.object({
  teamUuid: z.string().uuid().optional(),
  folderUuid: z.string().uuid().optional(),
  url: z.string().optional(),
  title: z.string().min(1).optional(),
  tags: z.string().array().min(1).optional(),
  summary: z.string().min(1).optional(),
});
