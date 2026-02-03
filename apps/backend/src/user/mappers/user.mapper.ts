import type { User as PrismaUser } from "@prisma/client";
import { User } from "../entities/user.entity";

export class UserMapper {
  /**
   * Prisma User → User 엔티티 변환
   * @param prismaUser Prisma User 객체
   * @returns 애플리케이션에서 사용할 사용자 엔티티
   */
  static fromPrisma(prismaUser: PrismaUser): User {
    return new User({
      userId: prismaUser.id,
      userUuid: prismaUser.uuid,
      userEmail: prismaUser.email ?? undefined,
      userNickname: prismaUser.nickname,
      createdAt: prismaUser.createdAt,
    });
  }
}
