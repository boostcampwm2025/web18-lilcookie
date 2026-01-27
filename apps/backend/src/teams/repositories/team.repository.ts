import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { ITeamRepository } from "./team.repository.interface";
import { Team } from "../entities/team.entity";
import { Member } from "../entities/member.entity";
import { TeamMapper } from "../mappers/team.mapper";
import { MemberMapper } from "../mappers/member.mapper";
import { UserMapper } from "../../user/mappers/user.mapper";
import { MemberWithUser, TeamWithRole } from "../types/team.types";
import { Prisma } from "@prisma/client";

@Injectable()
export class TeamRepository implements ITeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 팀 생성
   * @param teamName - 생성할 팀 이름
   * @returns 생성된 팀 엔티티
   */
  async create(teamName: string): Promise<Team> {
    const created = await this.prisma.team.create({
      data: { name: teamName },
    });
    return TeamMapper.toDomain(created);
  }

  /**
   * 팀 UUID로 팀 조회
   * @param teamUuid - 팀 UUID
   * @returns 팀 엔티티 또는 null
   */
  async findByUuid(teamUuid: string): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { uuid: teamUuid },
    });
    return team ? TeamMapper.toDomain(team) : null;
  }

  /**
   * 팀에 멤버 추가
   * @param teamId - 팀 PK
   * @param userId - 유저 PK
   * @param role - 멤버 역할
   * @returns 생성된 멤버 엔티티
   */
  async addMember(teamId: number, userId: number, role: string): Promise<Member> {
    const created = await this.prisma.member.create({
      data: { teamId, userId, role },
    });
    return MemberMapper.toDomain(created);
  }

  /**
   * 팀에서 멤버 제거
   * @param teamId - 팀 PK
   * @param userId - 유저 PK
   * @returns 제거 성공 여부
   */
  async removeMember(teamId: number, userId: number): Promise<boolean> {
    try {
      await this.prisma.member.delete({
        where: { teamId_userId: { teamId, userId } },
      });
      return true;
    } catch (error) {
      // 레코드가 없는 경우만 false 반환
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return false;
      }
      throw error;
    }
  }

  /**
   * 팀의 모든 멤버 + 유저 정보 조회
   * @param teamId - 팀 PK
   * @Returns 멤버와 유저 정보 배열
   */
  async findMembersByTeamId(teamId: number): Promise<MemberWithUser[]> {
    const members = await this.prisma.member.findMany({
      where: { teamId },
      include: { user: true },
    });
    return members.map((m) => ({
      member: MemberMapper.toDomain(m),
      user: UserMapper.toDomain(m.user),
    }));
  }

  /**
   * 특정 유저가 속한 팀들과 역할 조회
   * @param userId - 유저 PK
   * @returns 팀과 역할 배열
   */
  async findTeamsWithRoleByUserId(userId: number): Promise<TeamWithRole[]> {
    const members = await this.prisma.member.findMany({
      where: { userId },
      include: { team: true },
    });
    return members.map((m) => ({
      team: TeamMapper.toDomain(m.team),
      role: m.role,
    }));
  }

  /**
   * 특정 팀 ID로 팀 조회
   * @param teamId - 팀 PK
   * @returns 팀 엔티티 또는 null
   */
  async findById(teamId: number): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    return team ? TeamMapper.toDomain(team) : null;
  }

  /**
   * 특정 팀의 특정 멤버 조회
   * @param teamId - 팀 PK
   * @param userId - 유저 PK
   * @returns 멤버 엔티티 또는 null
   */
  async findMember(teamId: number, userId: number): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    return member ? MemberMapper.toDomain(member) : null;
  }
}
