import { z } from "zod";

export const RoleSchema = z.enum(["owner", "member"]);

export const CreatedBySchema = z.object({
  userUuid: z.uuid(),
  userName: z.string(),
});

export const TeamBaseSchema = z.object({
  teamUuid: z.uuid(),
  teamName: z.string(),
  createdAt: z.iso.datetime(),
});

export const FolderBaseSchema = z.object({
  folderUuid: z.uuid(),
  folderName: z.string(),
  createdAt: z.iso.datetime(),
});
