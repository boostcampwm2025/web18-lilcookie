import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { IRefreshTokenRepository } from "./refresh-token.repository.interface";
import { RefreshToken } from "../entities/refresh-token.entity";

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const created = await this.prisma.refreshToken.create({
      data: {
        uuid: refreshToken.jti,
        userId: refreshToken.userId,
        tokenHash: refreshToken.tokenHash,
        expiresAt: refreshToken.expiresAt,
      },
    });

    return new RefreshToken({
      id: created.id,
      jti: created.uuid,
      userId: created.userId,
      tokenHash: created.tokenHash,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
    });
  }

  async deleteByJtiAndUser(jti: string, userUuid: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: {
        uuid: jti,
        user: {
          uuid: userUuid,
        },
      },
    });
  }

  async findByJtiAndUser(jti: string, userUuid: string): Promise<RefreshToken | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: {
        uuid: jti,
        user: {
          uuid: userUuid,
        },
      },
    });

    if (!token) {
      return null;
    }

    return new RefreshToken({
      id: token.id,
      jti: token.uuid,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
    });
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
