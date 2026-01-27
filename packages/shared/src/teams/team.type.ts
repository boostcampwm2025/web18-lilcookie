import z from "zod";
import {
  CreateTeamRequestSchema,
  GetTeamMembersResponsdDataSchema,
  PreviewTeamRespondDataSchema,
  TeamResponseDataSchema,
} from "./team.schema";

export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;
export type TeamResponseData = z.infer<typeof TeamResponseDataSchema>;
export type PreviewTeamResponeData = z.infer<
  typeof PreviewTeamRespondDataSchema
>;
export type GetTeamMembersRespondData = z.infer<
  typeof GetTeamMembersResponsdDataSchema
>;
