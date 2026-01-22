import { Team, TeamMember } from "../entities/team.entity";

export interface ITeamRepository {
  create(name: string): Promise<Team>;
  findByUuid(uuid: string): Promise<Team | null>;
  findByUserId(userId: number): Promise<Team | null>;

  addMember(teamId: number, userId: number, role: string): Promise<TeamMember>;
  removeMember(teamId: number, userId: number): Promise<boolean>;
  findMembersByTeamId(teamId: number): Promise<TeamMember[]>;
  findMemberByUserId(userId: number): Promise<TeamMember | null>;
}
