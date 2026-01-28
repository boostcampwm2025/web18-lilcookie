import { z } from "zod";
import {
  CreateFolderRequestSchema,
  FolderResponseDataSchema,
  PatchFolderRequestSchema,
} from "./folder.schema";

export type CreateFolderRequest = z.infer<typeof CreateFolderRequestSchema>;
export type FolderResponseData = z.infer<typeof FolderResponseDataSchema>;
export type PatchFolderRequset = z.infer<typeof PatchFolderRequestSchema>;
