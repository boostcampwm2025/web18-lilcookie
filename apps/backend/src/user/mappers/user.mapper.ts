import type { User as PrismaUser } from "@prisma/client";
import { User } from "../entities/user.entity";
import { SimpleUserInfo } from "../types/user.types";

export class UserMapper {
  /**
   * Prisma User → User 엔티티
   * @param prismaUser 프리즈마 사용자 객체
   * @returns 사용자 엔티티
   */
  static toDomain(prismaUser: PrismaUser): User {
    return new User({
      userId: prismaUser.id,
      userUuid: prismaUser.uuid,
      userNickname: prismaUser.nickname,
      createdAt: prismaUser.createdAt,
    });
  }

  /**
   * User 엔티티 → 간단한 사용자 정보
   * @param user 사용자 엔티티
   * @returns 간단한 사용자 정보
   */
  static toSimpleInfo(user: User): SimpleUserInfo {
    return {
      userUuid: user.userUuid,
      userName: user.userNickname,
    };
  }
}
