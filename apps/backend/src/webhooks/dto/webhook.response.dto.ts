import { Webhook } from "../entities/webhook.entity";

/**
 * 웹훅 응답 DTO
 */
export class WebhookResponseDto {
  webhookUuid: string;
  url: string;
  isActive: boolean;

  constructor(data: { webhookUuid: string; url: string; isActive: boolean }) {
    this.webhookUuid = data.webhookUuid;
    this.url = data.url;
    this.isActive = data.isActive;
  }

  static from(webhook: Webhook): WebhookResponseDto {
    return new WebhookResponseDto({
      webhookUuid: webhook.webhookUuid,
      url: webhook.url,
      isActive: webhook.isActive,
    });
  }
}
