/**
 * 웹훅 엔티티
 */
export class Webhook {
  webhookId: number;
  webhookUuid: string;
  url: string;
  isActive: boolean;
  teamId: number;

  constructor(partial: Partial<Webhook>) {
    Object.assign(this, partial);
  }
}
