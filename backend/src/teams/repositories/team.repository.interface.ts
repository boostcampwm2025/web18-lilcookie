import { Team, TeamMember } from "../entities/team.entity";

export interface ITeamRepository {
  create(name: string): Promise<Team>;
  findByUuid(teamUuid: string): Promise<Team | null>;
  addMember(teamId: number, userId: number, role: string): Promise<TeamMember>;
  removeMember(teamId: number, userId: number): Promise<boolean>;
  findMembersByTeamId(teamId: number): Promise<TeamMember[]>;
  findTeamsWithRoleByUserId(userId: number): Promise<Array<{ team: Team; role: string }>>;
  findById(teamId: number): Promise<Team | null>;
  findMember(teamId: number, userId: number): Promise<TeamMember | null>;
}
