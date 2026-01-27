import { Inject, Injectable, type LoggerService } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { ILinkRepository } from "./link.repository.interface";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { LinkMapper } from "../mappers/link.mapper";
import { UserMapper } from "../../user/mappers/user.mapper";
import { LinkWithCreator, CreateLinkInput, UpdateLinkInput, LinkSearchCriteria } from "../types/link.types";

/**
 * prisma link에 관련된 include 옵션 모음
 */
const LINK_INCLUDE = {
  creator: true,
  team: true,
  folder: true,
} as const;

@Injectable()
export class LinkRepository implements ILinkRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * 링크 생성
   * @param data 생성할 링크 데이터
   * @returns 생성된 링크와 생성한 사용자 정보
   */
  async create(data: CreateLinkInput): Promise<LinkWithCreator> {
    const created = await this.prisma.link.create({
      data: {
        teamId: data.teamId,
        folderId: data.folderId,
        url: data.url,
        title: data.title,
        tags: data.tags,
        summary: data.summary,
        createdBy: data.createdBy,
      },
      include: LINK_INCLUDE,
    });

    return {
      link: LinkMapper.toDomain(created),
      creator: UserMapper.toDomain(created.creator),
    };
  }

  /**
   * 링크 목록 조회 (조건 검색)
   * @param criteria 검색 조건
   * @returns 조건에 맞는 링크와 생성한 사용자 정보 배열
   */
  async findAll(criteria: LinkSearchCriteria): Promise<LinkWithCreator[]> {
    const where: { teamId?: number | { in: number[] }; folderId?: number } = {};

    // teamIds가 있으면 우선, 없으면 teamId 사용
    // 왜 teamIds? 사용자가 속한 여러 팀에서 링크를 조회할 때 필요
    if (criteria.teamIds && criteria.teamIds.length > 0) {
      where.teamId = { in: criteria.teamIds };
    } else if (criteria.teamId) {
      where.teamId = criteria.teamId;
    }

    if (criteria.folderId) {
      where.folderId = criteria.folderId;
    }

    const links = await this.prisma.link.findMany({
      where,
      include: LINK_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    let result = links.map((l) => ({
      link: LinkMapper.toDomain(l),
      creator: UserMapper.toDomain(l.creator),
    }));

    // 태그 필터링 (클라이언트 사이드 - SQLite JSON 지원 제한)
    if (criteria.tags && criteria.tags.length > 0) {
      result = result.filter(({ link }) => {
        const linkTags = link.getParsedTags();
        if (linkTags.length === 0) {
          this.logger.warn(`링크 ${link.linkUuid}의 tags 필드에 잘못된 JSON: ${link.linkTags}`);
          return false;
        }
        return criteria.tags!.every((tag) => linkTags.includes(tag));
      });
    }

    return result;
  }

  /**
   * 링크 단건 조회
   * @param linkUuid 링크 UUID
   * @returns 링크와 생성한 사용자 정보 또는 null
   */
  async findByUuid(linkUuid: string): Promise<LinkWithCreator | null> {
    const link = await this.prisma.link.findUnique({
      where: { uuid: linkUuid },
      include: LINK_INCLUDE,
    });

    if (!link) {
      return null;
    }

    return {
      link: LinkMapper.toDomain(link),
      creator: UserMapper.toDomain(link.creator),
    };
  }

  /**
   * 특정 링크 수정
   * @param linkId 링크 ID
   * @param data 수정할 링크 데이터
   * @returns 수정된 링크와 생성한 사용자 정보 또는 null
   */
  async update(linkId: number, data: UpdateLinkInput): Promise<LinkWithCreator | null> {
    try {
      const updated = await this.prisma.link.update({
        where: { id: linkId },
        // 부분 업데이트를 위해 조건부로 데이터 설정 (옵셔널 필드)
        data: {
          ...(data.teamId !== undefined && { teamId: data.teamId }),
          ...(data.folderId !== undefined && { folderId: data.folderId }),
          ...(data.url !== undefined && { url: data.url }),
          ...(data.title !== undefined && { title: data.title }),
          ...(data.tags !== undefined && { tags: data.tags }),
          ...(data.summary !== undefined && { summary: data.summary }),
        },
        include: LINK_INCLUDE,
      });

      return {
        link: LinkMapper.toDomain(updated),
        creator: UserMapper.toDomain(updated.creator),
      };
    } catch {
      return null;
    }
  }

  /**
   * 특정 링크 삭제
   * @param linkId 링크 ID
   * @returns 삭제 성공 여부
   */
  async remove(linkId: number): Promise<boolean> {
    try {
      await this.prisma.link.delete({ where: { id: linkId } });
      return true;
    } catch {
      return false;
    }
  }
}
