import { z } from "zod";

export const RoleSchema = z.enum(["owner", "member"]);

export const CreatedBySchema = z.object({
  userUuid: z.string().uuid(),
  userName: z.string(),
});

export const TeamBaseSchema = z.object({
  teamUuid: z.string().uuid(),
  teamName: z.string(),
  createdAt: z.string().datetime(),
});

export const FolderBaseSchema = z.object({
  folderUuid: z.string().uuid(),
  folderName: z.string(),
  createdAt: z.string().datetime(),
});
