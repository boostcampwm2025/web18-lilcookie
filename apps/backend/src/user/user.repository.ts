import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { User } from "./entities/user.entity";
import { UserMapper } from "./mappers/user.mapper";
import { UpsertUserInput } from "./types/user.types";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * UUID로 사용자 조회
   * @param userUuid 사용자 UUID
   * @returns 사용자 엔티티 또는 null
   */
  async findByUuid(userUuid: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { uuid: userUuid } });
    return prismaUser ? UserMapper.fromPrisma(prismaUser) : null;
  }

  /**
   * ID로 사용자 조회
   * @param userId 사용자 ID (PK)
   * @return 사용자 엔티티 또는 null
   */
  async findById(userId: number): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id: userId } });
    return prismaUser ? UserMapper.fromPrisma(prismaUser) : null;
  }

  /**
   * 사용자 생성 또는 업데이트 (Upsert)
   * @param data Upsert 데이터
   * @return 생성 또는 업데이트된 사용자 엔티티
   */
  async upsert(data: UpsertUserInput): Promise<User> {
    // 기존 사용자 조회
    const existingUser = await this.prisma.user.findUnique({
      where: { uuid: data.uuid },
    });

    if (existingUser) {
      // 변경된 경우에만 업데이트
      if (existingUser.email !== data.email || existingUser.nickname !== data.nickname) {
        const updated = await this.prisma.user.update({
          where: { uuid: data.uuid },
          data: { email: data.email, nickname: data.nickname },
        });
        return UserMapper.fromPrisma(updated);
      }
      return UserMapper.fromPrisma(existingUser);
    }

    const created = await this.prisma.user.create({
      data: {
        uuid: data.uuid,
        email: data.email,
        nickname: data.nickname,
      },
    });
    return UserMapper.fromPrisma(created);
  }
}
