import type { Link as PrismaLink, Team as PrismaTeam, Folder as PrismaFolder } from "@prisma/client";
import { Link } from "../entities/link.entity";

/**
 * Prisma Link + Relations 타입
 * 팀, 폴더 정보 포함
 */
type PrismaLinkWithRelations = PrismaLink & {
  team: PrismaTeam;
  folder: PrismaFolder;
};

export class LinkMapper {
  /**
   * Prisma Link + Relations → Link 엔티티 변환
   * @param prismaLink Prisma Link + Relations 객체
   * @return 애플리케이션에서 사용할 링크 엔티티
   */
  static fromPrisma(prismaLink: PrismaLinkWithRelations): Link {
    return new Link({
      linkId: prismaLink.id,
      linkUuid: prismaLink.uuid,
      teamId: prismaLink.teamId,
      teamUuid: prismaLink.team.uuid,
      folderId: prismaLink.folderId,
      folderUuid: prismaLink.folder.uuid,
      linkUrl: prismaLink.url,
      linkTitle: prismaLink.title,
      linkTags: prismaLink.tags,
      linkSummary: prismaLink.summary,
      createdAt: prismaLink.createdAt,
      createdBy: prismaLink.createdBy,
    });
  }
}
