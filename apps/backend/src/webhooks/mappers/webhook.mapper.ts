import type { TeamWebhook as PrismaWebhook } from "@prisma/client";
import { Webhook } from "../entities/webhook.entity";

export class WebhookMapper {
  /**
   * Prisma TeamWebhook → Webhook 엔티티 변환
   */
  static fromPrisma(prismaWebhook: PrismaWebhook): Webhook {
    return new Webhook({
      webhookId: prismaWebhook.id,
      webhookUuid: prismaWebhook.uuid,
      url: prismaWebhook.url,
      isActive: prismaWebhook.isActive,
      teamId: prismaWebhook.teamId,
    });
  }
}
