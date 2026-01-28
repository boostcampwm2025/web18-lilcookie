import type { Member as PrismaMember } from "@prisma/client";
import { Member } from "../entities/member.entity";

export class MemberMapper {
  /**
   * Prisma Member → Member 엔티티 변환
   * @param prismaMember Prisma Member 객체
   * @returns 애플리케이션에서 사용할 멤버 엔티티
   */
  static fromPrisma(prismaMember: PrismaMember): Member {
    return new Member({
      memberId: prismaMember.id,
      teamId: prismaMember.teamId,
      userId: prismaMember.userId,
      role: prismaMember.role,
      joinedAt: prismaMember.joinedAt,
    });
  }
}
