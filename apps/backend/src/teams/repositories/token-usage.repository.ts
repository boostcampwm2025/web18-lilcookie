import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { TokenUsage } from "../entities/token-usage.entity";
import { TokenUsageMapper } from "../mappers/token-usage.mapper";

@Injectable()
export class TokenUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 오늘 날짜 문자열 (KST)
  private getTodayDate(): string {
    const now = new Date();
    // KST = UTC + 9
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().split("T")[0]; // "2024-01-29"
  }

  // 오늘 사용량 조회 (없으면 생성)
  async getOrCreateToday(teamId: number): Promise<TokenUsage> {
    const today = this.getTodayDate();

    const usage = await this.prisma.teamTokenUsage.upsert({
      where: { teamId_date: { teamId, date: today } },
      create: { teamId, date: today, usedTokens: 0, maxTokens: 20000 },
      update: {},
    });

    return TokenUsageMapper.fromPrisma(usage);
  }

  // 사용량 증가
  async addUsage(teamId: number, tokens: number): Promise<TokenUsage> {
    const today = this.getTodayDate();

    const usage = await this.prisma.teamTokenUsage.upsert({
      where: { teamId_date: { teamId, date: today } },
      create: { teamId, date: today, usedTokens: tokens, maxTokens: 20000 },
      update: { usedTokens: { increment: tokens } },
    });

    return TokenUsageMapper.fromPrisma(usage);
  }
}
