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
  slackChannelId: string;

  constructor(data: {
    linkId: number;
    teamId: number;
    url: string;
    title: string;
    tags: string[];
    summary: string;
    createdBy: number;
    createdAt: Date;
    slackChannelId: string;
  }) {
    this.linkId = data.linkId;
    this.teamId = data.teamId;
    this.url = data.url;
    this.title = data.title;
    this.tags = data.tags;
    this.summary = data.summary;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.slackChannelId = data.slackChannelId;
  }

  static fromLink(link: Link, slackChannelId: string): LinkNotificationDto {
    return new LinkNotificationDto({
      linkId: link.linkId,
      teamId: link.teamId,
      url: link.linkUrl,
      title: link.linkTitle,
      tags: link.getParsedTags(),
      summary: link.linkSummary,
      createdBy: link.createdBy,
      createdAt: link.createdAt,
      slackChannelId,
    });
  }
}
