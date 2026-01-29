import type { TeamTokenUsage as PrismaTokenUsage } from "@prisma/client";
import { TokenUsage } from "../entities/token-usage.entity";

export class TokenUsageMapper {
  static fromPrisma(prisma: PrismaTokenUsage): TokenUsage {
    return new TokenUsage({
      id: prisma.id,
      teamId: prisma.teamId,
      date: prisma.date,
      usedTokens: prisma.usedTokens,
      maxTokens: prisma.maxTokens,
    });
  }
}
