import { Link } from "../entities/link.entity";

export class LinkResponseDto {
  linkId: string;
  teamId: string;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: string;
  createdBy: string;
  folderId: string | null;

  constructor(partial: Partial<LinkResponseDto>) {
    Object.assign(this, partial);
  }

  static from(link: Link): LinkResponseDto {
    return new LinkResponseDto({
      linkId: link.linkId,
      teamId: link.teamId,
      url: link.url,
      title: link.title,
      tags: link.tags,
      summary: link.summary,
      createdAt: link.createdAt,
      createdBy: link.createdBy,
      folderId: link.folderId,
    });
  }
}
