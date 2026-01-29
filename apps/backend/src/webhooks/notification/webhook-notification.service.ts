import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { retryWithBackoff } from "../../common/http.operators";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Inject, Injectable, type LoggerService } from "@nestjs/common";
import { WebhookRepository } from "../repositories/webhook.repository";
import { Link } from "../../links/entities/link.entity";
import { User } from "../../user/entities/user.entity";
import { Team } from "../../teams/entities/team.entity";
import { Folder } from "../../folders/entities/folder.entity";
import { WebhookEventBuilder } from "../builders/webhook-event.builder";
import { WebhookEventPayload } from "../types/webhook-event.types";

@Injectable()
export class WebhookNotificationService {
  private readonly isEnabled: boolean;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly webhookRepository: WebhookRepository,
  ) {
    this.isEnabled = this.configService.get<string>("NOTIFICATION_ENABLED") !== "false";

    if (!this.isEnabled) {
      this.logger.log("알림 기능이 비활성화됩니다.");
    }
  }

  /**
   * 링크 생성 알림 전송
   * 팀에 등록된 모든 활성화된 웹훅으로 이벤트 전송
   * @param link 생성된 링크 엔티티
   * @param creator 생성자 유저 엔티티
   * @param team 팀 엔티티
   * @param folder 폴더 엔티티
   */
  async notifyLinkCreated(link: Link, creator: User, team: Team, folder: Folder): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    const webhooks = await this.webhookRepository.findActiveByTeamId(link.teamId);
    if (webhooks.length === 0) {
      this.logger.log(`팀(${link.teamId})에 등록된 웹훅이 없습니다.`);
      return;
    }

    const payload = WebhookEventBuilder.linkCreated(link, creator, team, folder);

    // 모든 웹훅에 병렬로 전송
    const results = await Promise.allSettled(webhooks.map((webhook) => this.sendWebhook(webhook.url, payload)));

    // 결과 로깅
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        this.logger.log(`웹훅 전송 성공: ${webhooks[index].url}`);
      } else {
        this.logger.error(`웹훅 전송 실패: ${webhooks[index].url} - ${result.reason}`);
      }
    });
  }

  /**
   * 웹훅 URL로 페이로드 전송
   * @param url 웹훅 URL
   * @param payload 전송할 페이로드
   */
  private async sendWebhook(url: string, payload: WebhookEventPayload): Promise<void> {
    await firstValueFrom(
      this.httpService
        .post(url, payload, {
          timeout: 5000,
          headers: {
            "Content-Type": "application/json",
          },
        })
        .pipe(retryWithBackoff()),
    );
  }
}
