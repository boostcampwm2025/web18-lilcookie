import { z } from "zod";
import { CreatedBySchema } from "../common/common.schema.js";

export const CreateLinkRequestSchema = z.object({
  teamUuid: z.uuid(),
  folderUuid: z.uuid().optional(),
  url: z.string(),
  title: z.string().min(1),
  tags: z.array(z.string()).min(1),
  summary: z.string().min(1),
});

export const LinkResponseDataSchema = z.object({
  linkUuid: z.uuid(),
  teamUuid: z.uuid(),
  folderUuid: z.uuid(),
  url: z.string(),
  title: z.string(),
  tags: z.array(z.string()).min(1),
  summary: z.string(),
  createdAt: z.iso.datetime(),
  createdBy: CreatedBySchema,
});

export const PatchLinkRequestSchema = CreateLinkRequestSchema.partial();
