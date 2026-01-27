import { Team } from "../entities/team.entity";
import { Member } from "../entities/member.entity";
import { MemberWithUser, TeamWithRole } from "../types/team.types";

export interface ITeamRepository {
  create(teamName: string): Promise<Team>;
  findByUuid(teamUuid: string): Promise<Team | null>;
  addMember(teamId: number, userId: number, role: string): Promise<Member>;
  removeMember(teamId: number, userId: number): Promise<boolean>;
  findMembersByTeamId(teamId: number): Promise<MemberWithUser[]>;
  findTeamsWithRoleByUserId(userId: number): Promise<TeamWithRole[]>;
  findById(teamId: number): Promise<Team | null>;
  findMember(teamId: number, userId: number): Promise<Member | null>;
}
