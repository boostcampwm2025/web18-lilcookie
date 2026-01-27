import type { Team as PrismaTeam } from "@prisma/client";
import { Team } from "../entities/team.entity";

export class TeamMapper {
  /**
   * Prisma Team → 도메인 Team 엔티티 변환
   * @param prismaTeam - 프리즈마 팀 객체
   * @returns 도메인 팀 엔티티
   */
  static toDomain(prismaTeam: PrismaTeam): Team {
    return new Team({
      teamId: prismaTeam.id,
      teamUuid: prismaTeam.uuid,
      teamName: prismaTeam.name,
      createdAt: prismaTeam.createdAt,
    });
  }
}
