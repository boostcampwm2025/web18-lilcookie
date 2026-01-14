import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { ILinkRepository } from "./link.repository.interface";
import { Link } from "../entities/link.entity";

@Injectable()
export class LinkRepository implements ILinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(link: Link): Promise<Link> {
    const created = await this.prisma.link.create({
      data: {
        linkId: link.linkId,
        teamId: link.teamId,
        url: link.url,
        title: link.title,
        tags: JSON.stringify(link.tags),
        summary: link.summary,
        createdAt: link.createdAt,
        createdBy: link.createdBy,
        folderId: link.folderId,
      },
    });

    return new Link({
      linkId: created.linkId,
      teamId: created.teamId,
      url: created.url,
      title: created.title,
      tags: JSON.parse(created.tags) as string[],
      summary: created.summary,
      createdAt: created.createdAt,
      createdBy: created.createdBy,
      folderId: created.folderId,
    });
  }

  async findAll(teamId?: string, tags?: string[], createdAfter?: Date): Promise<Link[]> {
    const where: {
      teamId?: string;
      createdAt?: {
        gt: string;
      };
    } = {};

    if (teamId) {
      where.teamId = teamId.toLowerCase();
    }

    if (createdAfter) {
      where.createdAt = {
        gt: createdAfter.toISOString(),
      };
    }

    const links = await this.prisma.link.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    let result = links.map(
      (link) =>
        new Link({
          linkId: link.linkId,
          teamId: link.teamId,
          url: link.url,
          title: link.title,
          tags: JSON.parse(link.tags) as string[],
          summary: link.summary,
          createdAt: link.createdAt,
          createdBy: link.createdBy,
          folderId: link.folderId,
        }),
    );

    // 태그 필터링 (클라이언트 사이드)
    if (tags && tags.length > 0) {
      result = result.filter((link) => tags.every((tag) => link.tags.includes(tag)));
    }

    return result;
  }

  async findOne(linkId: string): Promise<Link | null> {
    const link = await this.prisma.link.findUnique({
      where: {
        linkId,
      },
    });

    if (!link) {
      return null;
    }

    return new Link({
      linkId: link.linkId,
      teamId: link.teamId,
      url: link.url,
      title: link.title,
      tags: JSON.parse(link.tags) as string[],
      summary: link.summary,
      createdAt: link.createdAt,
      createdBy: link.createdBy,
      folderId: link.folderId,
    });
  }

  async remove(linkId: string): Promise<boolean> {
    try {
      await this.prisma.link.delete({
        where: {
          linkId,
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
