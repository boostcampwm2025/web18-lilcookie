import { z } from "zod";
import { CreatedBySchema } from "../common/common.schema.js";

/** 링크 생성 요청 */
export const CreateLinkRequestSchema = z.object({
  teamUuid: z.string().uuid(),
  folderUuid: z.string().uuid().optional(),
  url: z.string(),
  title: z.string().min(1),
  tags: z.array(z.string()).min(1),
  summary: z.string().min(1),
});

/** 링크 공통 응답 */
export const LinkResponseDataSchema = z.object({
  linkUuid: z.string().uuid(),
  teamUuid: z.string().uuid(),
  folderUuid: z.string().uuid(),
  url: z.string(),
  title: z.string(),
  tags: z.array(z.string()).min(1),
  summary: z.string(),
  createdAt: z.string().datetime(),
  createdBy: CreatedBySchema,
});

/** 링크 수정 요청 */
export const PatchLinkRequestSchema = CreateLinkRequestSchema.partial();
