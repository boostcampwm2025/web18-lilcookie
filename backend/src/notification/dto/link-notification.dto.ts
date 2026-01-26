import { Link } from "../../links/entities/link.entity";

export class LinkNotificationDto {
  linkId: number;
  teamId: number;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdBy: number;
  createdAt: Date;
  slackChannelId?: string;

  constructor(partial: Partial<LinkNotificationDto>) {
    Object.assign(this, partial);
  }

  static fromLink(link: Link, slackChannelId?: string): LinkNotificationDto {
    return new LinkNotificationDto({
      linkId: link.id,
      teamId: link.teamId,
      url: link.url,
      title: link.title,
      tags: safeJsonParse(link.tags),
      summary: link.summary,
      createdBy: link.createdBy,
      createdAt: link.createdAt,
      slackChannelId,
    });
  }
}

function safeJsonParse<T>(value: string): T {
  return JSON.parse(value) as T;
}
