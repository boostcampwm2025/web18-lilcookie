import { z } from "zod";
import {
  CreateLinkRequestSchema,
  LinkResponseDataSchema,
  PatchLinkRequestSchema,
} from "./link.schema.js";

export type CreateLinkRequest = z.infer<typeof CreateLinkRequestSchema>;
export type LinkResponseData = z.infer<typeof LinkResponseDataSchema>;
export type PatchLinkRequest = z.infer<typeof PatchLinkRequestSchema>;
