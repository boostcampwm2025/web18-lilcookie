import type { Link as PrismaLink, Team as PrismaTeam, Folder as PrismaFolder } from "@prisma/client";
import { Link } from "../entities/link.entity";
import { LinkResponseDto } from "../dto/link.response.dto";
import { User } from "../../user/entities/user.entity";

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
   * Prisma Link + Relations → 도메인 Link 엔티티 변환
   * 팀 UUID, 폴더 UUID 포함
   * @param prismaLink Prisma Link + Relations 객체
   * @return 도메인 Link 엔티티
   */
  static toDomain(prismaLink: PrismaLinkWithRelations): Link {
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

  /**
   * 도메인 Link 엔티티 + 생성자 User → 링크 응답 DTO 변환
   * @param link 링크 엔티티
   * @param creator 생성한 사용자 엔티티
   * @return 링크 응답 DTO
   */
  static toResponse(link: Link, creator: User): LinkResponseDto {
    return new LinkResponseDto({
      linkUuid: link.linkUuid,
      teamUuid: link.teamUuid,
      folderUuid: link.folderUuid,
      url: link.linkUrl,
      title: link.linkTitle,
      tags: link.getParsedTags(),
      summary: link.linkSummary,
      createdAt: link.createdAt.toISOString(),
      createdBy: {
        userUuid: creator.userUuid,
        userName: creator.userNickname,
      },
    });
  }
}
