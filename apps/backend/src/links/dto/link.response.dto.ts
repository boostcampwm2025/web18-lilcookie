import { Link } from "../entities/link.entity";

export class LinkResponseDto {
  uuid: string;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: Date;
  createdBy: number;

  constructor(partial: Partial<LinkResponseDto>) {
    Object.assign(this, partial);
  }

  static from(link: Link): LinkResponseDto {
    return new LinkResponseDto({
      uuid: link.uuid,
      url: link.url,
      title: link.title,
      tags: safeJsonParse(link.tags),
      summary: link.summary,
      createdAt: link.createdAt,
      createdBy: link.createdBy,
    });
  }
}

function safeJsonParse<T>(value: string): T {
  return JSON.parse(value) as T;
}
