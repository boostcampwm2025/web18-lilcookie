import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { ITeamRepository } from "./team.repository.interface";
import { Team, TeamMember } from "../entities/team.entity";

@Injectable()
export class TeamRepository implements ITeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 새 팀 생성
   * @param name - 팀 이름
   */
  async create(name: string): Promise<Team> {
    const created = await this.prisma.team.create({
      data: { name },
    });
    return new Team(created);
  }

  /**
   * UUID로 팀 조회 (외부 식별자)
   * @param teamUuid - 팀 UUID
   */
  async findByUuid(teamUuid: string): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { uuid: teamUuid },
    });
    return team ? new Team(team) : null;
  }

  /**
   * 팀에 멤버 추가
   * @param teamId - 팀 PK
   * @param userId - 유저 PK
   * @param role - 역할 ("owner" | "member")
   */
  async addMember(teamId: number, userId: number, role: string): Promise<TeamMember> {
    const created = await this.prisma.teamMember.create({
      data: { teamId, userId, role },
    });
    return new TeamMember(created);
  }

  /**
   * 팀에서 멤버 제거
   * @param teamId - 팀 PK
   * @param userId - 유저 PK
   */
  async removeMember(teamId: number, userId: number): Promise<boolean> {
    try {
      await this.prisma.teamMember.delete({
        where: { teamId_userId: { teamId, userId } },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 특정 팀의 모든 멤버 조회
   * @param teamId - 팀 PK
   */
  async findMembersByTeamId(teamId: number): Promise<TeamMember[]> {
    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
    });
    return members.map((m) => new TeamMember(m));
  }

  /**
   * 유저가 속한 모든 팀 + 역할 조회
   * @param userId - 유저 PK
   */
  async findTeamsWithRoleByUserId(userId: number): Promise<Array<{ team: Team; role: string }>> {
    const members = await this.prisma.teamMember.findMany({
      where: { userId },
      include: { team: true },
    });
    return members.map((m) => ({ team: new Team(m.team), role: m.role }));
  }

  /**
   * PK로 팀 조회 (내부용)
   * @param teamId - 팀 PK
   */
  async findById(teamId: number): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    return team ? new Team(team) : null;
  }

  /**
   * 특정 유저의 특정 팀 멤버십 조회
   * @param teamId - 팀 PK
   * @param userId - 유저 PK
   */
  async findMember(teamId: number, userId: number): Promise<TeamMember | null> {
    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    return member ? new TeamMember(member) : null;
  }
}
