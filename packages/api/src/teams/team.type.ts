import { z } from "zod";
import {
  CreateTeamRequestSchema,
  GetTeamMembersResponsedDataSchema,
  JoinTeamResponseDataSchema,
  PreviewTeamRespondDataSchema,
  TeamResponseDataSchema,
} from "./team.schema";

export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;
export type TeamResponseData = z.infer<typeof TeamResponseDataSchema>;
export type PreviewTeamResponeData = z.infer<
  typeof PreviewTeamRespondDataSchema
>;
export type JoinTeamResponseData = z.infer<typeof JoinTeamResponseDataSchema>;
export type GetTeamMembersResponseData = z.infer<
  typeof GetTeamMembersResponsedDataSchema
>;
