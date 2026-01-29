import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { Webhook } from "../entities/webhook.entity";
import { WebhookMapper } from "../mappers/webhook.mapper";

@Injectable()
export class WebhookRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 웹훅 생성
   * @param teamId 팀 PK
   * @param url 웹훅 URL
   * @returns 생성된 웹훅 엔티티
   */
  async create(teamId: number, url: string): Promise<Webhook> {
    const created = await this.prisma.teamWebhook.create({
      data: { teamId, url },
    });
    return WebhookMapper.fromPrisma(created);
  }

  /**
   * 팀의 모든 웹훅 조회
   * @param teamId 팀 PK
   * @returns 웹훅 엔티티 배열
   */
  async findByTeamId(teamId: number): Promise<Webhook[]> {
    const webhooks = await this.prisma.teamWebhook.findMany({
      where: { teamId },
    });
    return webhooks.map((w) => WebhookMapper.fromPrisma(w));
  }

  /**
   * 팀의 활성화된 웹훅만 조회
   * @param teamId 팀 PK
   * @returns 활성화된 웹훅 엔티티 배열
   */
  async findActiveByTeamId(teamId: number): Promise<Webhook[]> {
    const webhooks = await this.prisma.teamWebhook.findMany({
      where: { teamId, isActive: true },
    });
    return webhooks.map((w) => WebhookMapper.fromPrisma(w));
  }

  /**
   * UUID로 웹훅 조회
   * @param webhookUuid 웹훅 UUID
   * @returns 웹훅 엔티티 또는 null
   */
  async findByUuid(webhookUuid: string): Promise<Webhook | null> {
    const webhook = await this.prisma.teamWebhook.findUnique({
      where: { uuid: webhookUuid },
    });
    return webhook ? WebhookMapper.fromPrisma(webhook) : null;
  }

  /**
   * 웹훅 삭제
   * @param webhookId 웹훅 PK
   * @returns 삭제 성공 여부
   */
  async delete(webhookId: number): Promise<boolean> {
    try {
      await this.prisma.teamWebhook.delete({
        where: { id: webhookId },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 웹훅 활성화 상태 변경
   * @param webhookId 웹훅 PK
   * @param isActive 활성화 여부
   * @returns 업데이트된 웹훅 엔티티 또는 null
   */
  async updateActive(webhookId: number, isActive: boolean): Promise<Webhook | null> {
    try {
      const updated = await this.prisma.teamWebhook.update({
        where: { id: webhookId },
        data: { isActive },
      });
      return WebhookMapper.fromPrisma(updated);
    } catch {
      return null;
    }
  }
}
