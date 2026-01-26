import { Link } from "../entities/link.entity";

export class LinkResponseDto {
  id: number;
  teamId: number;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: Date;
  createdBy: number;
  folderId: number | null;

  constructor(partial: Partial<LinkResponseDto>) {
    Object.assign(this, partial);
  }

  static from(link: Link): LinkResponseDto {
    return new LinkResponseDto({
      id: link.id,
      teamId: link.teamId,
      url: link.url,
      title: link.title,
      tags: safeJsonParse(link.tags),
      summary: link.summary,
      createdAt: link.createdAt,
      createdBy: link.createdBy,
      folderId: link.folderId,
    });
  }
}

function safeJsonParse<T>(value: string): T {
  return JSON.parse(value) as T;
}
