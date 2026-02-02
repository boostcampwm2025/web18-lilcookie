import { z } from "zod";
import {
  CreateOAuthAppRequestSchema,
  OAuthAppResponseDataSchema,
  OAuthAppCreatedResponseDataSchema,
} from "./oauth-app.schema.js";

export type CreateOAuthAppRequest = z.infer<typeof CreateOAuthAppRequestSchema>;
export type OAuthAppResponseData = z.infer<typeof OAuthAppResponseDataSchema>;
export type OAuthAppCreatedResponseData = z.infer<typeof OAuthAppCreatedResponseDataSchema>;
