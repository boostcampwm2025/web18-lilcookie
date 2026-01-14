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
        userId: refreshToken.userId,
        tokenHash: refreshToken.tokenHash,
        expiresAt: refreshToken.expiresAt,
      },
    });

    return new RefreshToken({
      id: created.id,
      userId: created.userId,
      tokenHash: created.tokenHash,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
    });

    if (!token) {
      return null;
    }

    return new RefreshToken({
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
    });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
