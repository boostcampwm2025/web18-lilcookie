import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { retryWithBackoff } from "../common/http.operators";
import { LinkNotificationDto } from "./dto/link-notification.dto";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Inject, Injectable, type LoggerService } from "@nestjs/common";

@Injectable()
export class NotificationService {
  private readonly webhookUrl: string;
  private readonly isEnabled: boolean;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webhookUrl = this.configService.get<string>("N8N_WEBHOOK_URL") || "";
    this.isEnabled = this.configService.get<string>("NOTIFICATION_ENABLED") !== "false";

    if (!this.webhookUrl || !this.isEnabled) {
      this.logger.log("슬랙 알림 기능이 비활성화됩니다.");
    }
  }

  async notifyLinkCreated(linkNotificationDto: LinkNotificationDto): Promise<void> {
    if (!this.webhookUrl || !this.isEnabled) {
      return;
    }

    try {
      this.logger.log(`슬랙 알림 전송 시작: linkId=${linkNotificationDto.linkId}`);

      await firstValueFrom(
        this.httpService
          .post(
            this.webhookUrl,
            {
              event: "link.created",
              data: {
                linkId: linkNotificationDto.linkId,
                teamId: linkNotificationDto.teamId,
                url: linkNotificationDto.url,
                title: linkNotificationDto.title,
                tags: linkNotificationDto.tags,
                summary: linkNotificationDto.summary,
                createdBy: linkNotificationDto.createdBy,
                createdAt: linkNotificationDto.createdAt,
                slackChannelId: linkNotificationDto.slackChannelId,
              },
            },
            {
              timeout: 5000,
              headers: {
                "Content-Type": "application/json",
              },
            },
          )
          .pipe(retryWithBackoff()),
      );

      this.logger.log(`슬랙 알림 전송 성공: linkId=${linkNotificationDto.linkId}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error({
          message: "슬랙 알림 전송 실패",
          linkId: linkNotificationDto.linkId,
          error: error.message,
          stack: error.stack,
        });
      } else {
        this.logger.error({
          message: "슬랙 알림 전송 실패",
          linkId: linkNotificationDto.linkId,
          error: String(error),
        });
      }
    }
  }
}
