import { Injectable } from "@nestjs/common";
import { TokenUsageRepository } from "./repositories/token-usage.repository";
import { TeamRepository } from "./repositories/team.repository";

@Injectable()
export class TokenUsageService {
  constructor(
    private readonly tokenUsageRepository: TokenUsageRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  // 사용량 조회
  async getUsage(teamUuid: string) {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) throw new Error("팀을 찾을 수 없습니다");

    const usage = await this.tokenUsageRepository.getOrCreateToday(team.teamId);
    const percentage = Math.round((usage.usedTokens / usage.maxTokens) * 100);

    return {
      usedTokens: usage.usedTokens,
      maxTokens: usage.maxTokens,
      percentage: Math.min(percentage, 100),
    };
  }

  // 한도 체크
  async checkLimit(teamUuid: string): Promise<boolean> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) throw new Error("팀을 찾을 수 없습니다");

    const usage = await this.tokenUsageRepository.getOrCreateToday(team.teamId);
    return usage.usedTokens < usage.maxTokens;
  }

  // 사용량 기록
  async recordUsage(teamUuid: string, tokens: number): Promise<void> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) throw new Error("팀을 찾을 수 없습니다");

    await this.tokenUsageRepository.addUsage(team.teamId, tokens);
  }
}
