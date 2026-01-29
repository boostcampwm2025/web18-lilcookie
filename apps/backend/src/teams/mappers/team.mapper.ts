import type { Team as PrismaTeam } from "@prisma/client";
import { Team } from "../entities/team.entity";

export class TeamMapper {
  /**
   * Prisma Team → Team 엔티티 변환
   * @param prismaTeam Prisma Team 객체
   * @returns 애플리케이션에서 사용할 팀 엔티티
   */
  static fromPrisma(prismaTeam: PrismaTeam): Team {
    return new Team({
      teamId: prismaTeam.id,
      teamUuid: prismaTeam.uuid,
      teamName: prismaTeam.name,
      createdAt: prismaTeam.createdAt,
    });
  }
}
