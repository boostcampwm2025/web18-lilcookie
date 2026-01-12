import { Link } from "../../links/entities/link.entity";

export class LinkNotificationDto {
  linkId: string;
  teamId: string;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdBy: string;
  createdAt: string;
  slackChannelId?: string;

  constructor(partial: Partial<LinkNotificationDto>) {
    Object.assign(this, partial);
  }

  static fromLink(link: Link, slackChannelId?: string): LinkNotificationDto {
    return new LinkNotificationDto({
      linkId: link.linkId,
      teamId: link.teamId,
      url: link.url,
      title: link.title,
      tags: link.tags,
      summary: link.summary,
      createdBy: link.createdBy,
      createdAt: link.createdAt,
      slackChannelId,
    });
  }
}
