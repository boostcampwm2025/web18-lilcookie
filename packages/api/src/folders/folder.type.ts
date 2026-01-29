import { z } from "zod";
import {
  CreateFolderRequestSchema,
  FolderResponseDataSchema,
  PatchFolderRequestSchema,
} from "./folder.schema.js";

export type CreateFolderRequest = z.infer<typeof CreateFolderRequestSchema>;
export type FolderResponseData = z.infer<typeof FolderResponseDataSchema>;
export type PatchFolderRequest = z.infer<typeof PatchFolderRequestSchema>;
