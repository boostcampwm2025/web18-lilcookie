import { Link } from "../entities/link.entity";
import { User } from "../../user/entities/user.entity";

/**
 * 생성한 사용자 정보
 */
export interface CreatorInfo {
  userUuid: string;
  userName: string;
}

/**
 * 링크 응답 DTO
 */
export class LinkResponseDto {
  linkUuid: string;
  teamUuid: string;
  folderUuid: string;
  url: string;
  title: string;
  tags: string[];
  summary: string;
  createdAt: string;
  createdBy: CreatorInfo;

  constructor(data: {
    linkUuid: string;
    teamUuid: string;
    folderUuid: string;
    url: string;
    title: string;
    tags: string[];
    summary: string;
    createdAt: string;
    createdBy: CreatorInfo;
  }) {
    this.linkUuid = data.linkUuid;
    this.teamUuid = data.teamUuid;
    this.folderUuid = data.folderUuid;
    this.url = data.url;
    this.title = data.title;
    this.tags = data.tags;
    this.summary = data.summary;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
  }

  /**
   * Link 엔티티 + User 엔티티 → 링크 응답 DTO 변환
   * @param link 링크 엔티티
   * @param creator 생성한 사용자 엔티티
   * @returns 클라이언트 응답용 링크 DTO
   */
  static from(link: Link, creator: User): LinkResponseDto {
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
