import { z } from "zod";
import { CreatedBySchema, FolderBaseSchema } from "../common/common.schema.js";

/** 폴더 생성 요청 */
export const CreateFolderRequestSchema = z.object({
  teamUuid: z.string().uuid(),
  folderName: z.string().min(1),
});

/** 폴더 공통 응답 data */
export const FolderResponseDataSchema = FolderBaseSchema.extend({
  createdBy: CreatedBySchema,
});

/** 폴더이름 수정 요청 */
export const PatchFolderRequestSchema = z.object({
  folderName: z.string(),
});
