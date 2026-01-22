import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { ITeamRepository } from "./team.repository.interface";
import { Team, TeamMember } from "../entities/team.entity";

@Injectable()
export class TeamRepository implements ITeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string): Promise<Team> {
    const created = await this.prisma.team.create({
      data: { name },
    });
    return new Team(created);
  }

  async findByUuid(uuid: string): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { uuid },
    });
    return team ? new Team(team) : null;
  }

  async findByUserId(userId: number): Promise<Team | null> {
    const member = await this.prisma.teamMember.findFirst({
      where: { userId },
      include: { team: true },
    });
    return member ? new Team(member.team) : null;
  }

  async addMember(teamId: number, userId: number, role: string): Promise<TeamMember> {
    const created = await this.prisma.teamMember.create({
      data: { teamId, userId, role },
    });
    return new TeamMember(created);
  }

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

  async findMembersByTeamId(teamId: number): Promise<TeamMember[]> {
    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
    });
    return members.map((m) => new TeamMember(m));
  }

  async findMemberByUserId(userId: number): Promise<TeamMember | null> {
    const member = await this.prisma.teamMember.findFirst({
      where: { userId },
    });
    return member ? new TeamMember(member) : null;
  }
}
