import type { Member as PrismaMember } from "@prisma/client";
import { Member } from "../entities/member.entity";

export class MemberMapper {
  /**
   * Prisma Member → 도메인 Member 엔티티 변환
   * @param prismaMember - 프리즈마 멤버 객체
   * @returns 도메인 멤버 엔티티
   */
  static toDomain(prismaMember: PrismaMember): Member {
    return new Member({
      memberId: prismaMember.id,
      teamId: prismaMember.teamId,
      userId: prismaMember.userId,
      role: prismaMember.role,
      joinedAt: prismaMember.joinedAt,
    });
  }
}
