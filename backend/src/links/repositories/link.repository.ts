import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { ILinkRepository } from "./link.repository.interface";
import { Link } from "../entities/link.entity";

@Injectable()
export class LinkRepository implements ILinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(link: Omit<Link, "id" | "uuid" | "createdAt">): Promise<Link> {
    const created = await this.prisma.link.create({
      data: {
        teamId: link.teamId,
        url: link.url,
        title: link.title,
        tags: link.tags,
        summary: link.summary,
        createdBy: link.createdBy,
        folderId: link.folderId,
      },
    });

    return new Link(created);
  }

  async findAll(teamId?: number, folderId?: number, tags?: string[], createdAfter?: Date): Promise<Link[]> {
    const where: { teamId?: number; folderId?: number; createdAt?: { gt: Date } } = {};

    if (teamId) where.teamId = teamId;
    if (folderId) where.folderId = folderId;
    if (createdAfter) where.createdAt = { gt: createdAfter };

    const links = await this.prisma.link.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    let result = links.map((l) => new Link(l));

    // 태그 필터링 (클라이언트 사이드)
    if (tags && tags.length > 0) {
      result = result.filter((link) => {
        const linkTags = JSON.parse(link.tags) as string[];
        return tags.every((tag) => linkTags.includes(tag));
      });
    }

    return result;
  }

  async findOne(uuid: string): Promise<Link | null> {
    const link = await this.prisma.link.findUnique({
      where: { uuid },
    });

    return link ? new Link(link) : null;
  }

  async remove(uuid: string): Promise<boolean> {
    try {
      await this.prisma.link.delete({ where: { uuid } });
      return true;
    } catch {
      return false;
    }
  }
}
