import { Injectable, Inject, type LoggerService } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository";

@Injectable()
export class AuthScheduleService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  // 테스트용: 5초 간격 -> CronExpression.EVERY_5_SECONDS)
  // 배포용: 매일 새벽 4시 (UTC) -> CronExpression.EVERY_DAY_AT_4AM)
  @Cron(CronExpression.EVERY_DAY_AT_4AM, { name: "cleanupExpiredTokens" })
  async cleanupExpiredTokens(): Promise<void> {
    this.logger.log("--- [AuthScheduleService] 만료된 리프레시 토큰 정리 시작 ---");

    try {
      const deletedCount = await this.refreshTokenRepository.deleteExpiredTokens();
      if (deletedCount > 0) {
        this.logger.log(`[AuthScheduleService] 성공: ${deletedCount}개의 토큰을 삭제했습니다.`);
      }
    } catch (error: unknown) {
      this.logger.error(
        "--- [AuthScheduleService] 정리 중 에러 발생 ---",
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
