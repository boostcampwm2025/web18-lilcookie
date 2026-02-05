import { z } from "zod";
import {
  CreateTeamRequestSchema,
  GetTeamMembersResponsedDataSchema,
  GetTeamTokenUsageResponseDataSchema,
  GetTeamWebhooksResponseDataSchema,
  JoinTeamResponseDataSchema,
  PreviewTeamRespondDataSchema,
  TeamResponseDataSchema,
  TransferOwnershipRequestSchema,
  KickMembersRequestSchema,
} from "./team.schema.js";

export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;
export type TeamResponseData = z.infer<typeof TeamResponseDataSchema>;
export type PreviewTeamResponeData = z.infer<typeof PreviewTeamRespondDataSchema>;
export type JoinTeamResponseData = z.infer<typeof JoinTeamResponseDataSchema>;
export type GetTeamMembersResponseData = z.infer<typeof GetTeamMembersResponsedDataSchema>;
export type GetTeamWebhooksResponseData = z.infer<typeof GetTeamWebhooksResponseDataSchema>;
export type GetTeamTokenUsageResponseData = z.infer<typeof GetTeamTokenUsageResponseDataSchema>;
export type TransferOwnershipRequest = z.infer<typeof TransferOwnershipRequestSchema>;
export type KickMembersRequest = z.infer<typeof KickMembersRequestSchema>;
