import { Injectable, NotFoundException } from "@nestjs/common";
import { Link } from "./entities/link.entity";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";
import { ConfigService } from "@nestjs/config";
import { NotificationService } from "../notification/notification.service";
import { LinkNotificationDto } from "../notification/dto/link-notification.dto";
import { LinkRepository } from "./repositories/link.repository";
import { TeamRepository } from "src/teams/repositories/team.repository";
import { FolderRepository } from "src/folders/repositories/folder.repository";
import { GetLinksQueryDto } from "./dto/get-links-query.dto";

@Injectable()
export class LinksService {
  constructor(
    private readonly configService: ConfigService,
    private readonly linkRepository: LinkRepository,
    private readonly notificationService: NotificationService,
    private readonly teamRepository: TeamRepository,
    private readonly folderRepository: FolderRepository,
  ) {}

  // 새로운 Link 생성
  async create(dto: CreateLinkRequestDto, userId: number): Promise<Link> {
    const team = await this.teamRepository.findByUuid(dto.teamUuid);
    if (!team) throw new NotFoundException("팀이 존재하지 않습니다");

    let folderId: number | null = null;
    if (dto.folderUuid) {
      const folder = await this.folderRepository.findByUuid(dto.folderUuid);
      if (!folder) throw new NotFoundException("폴더가 존재하지 않습니다");
      folderId = folder.id;
    }
    const created = await this.linkRepository.create({
      teamId: team.id,
      folderId,
      url: dto.url,
      title: dto.title,
      tags: JSON.stringify(dto.tags),
      summary: dto.summary,
      createdBy: userId,
    });

    // 임시로 슬랙 채널 ID는 하드코딩(C0A6S6AM1K7)
    this.notificationService.notifyLinkCreated(LinkNotificationDto.fromLink(created, "C0A6S6AM1K7")).catch(() => {});

    return created;
  }

  // 목록 조회 (전체 또는 조건)
  async findAll(query: GetLinksQueryDto): Promise<Link[]> {
    const teamId = query.teamUuid ? (await this.teamRepository.findByUuid(query.teamUuid))?.id : undefined;

    const folderId = query.folderUuid ? (await this.folderRepository.findByUuid(query.folderUuid))?.id : undefined;

    const tags = query.tags?.split(",").map((t) => t.trim());
    const createdAfter = query.createdAfter ? new Date(query.createdAfter) : undefined;

    return this.linkRepository.findAll(teamId, folderId, tags, createdAfter);
  }

  // 단건 조회
  async findOne(uuid: string): Promise<Link> {
    const link = await this.linkRepository.findOne(uuid);

    if (!link) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${uuid}`);
    }

    return link;
  }

  // 단건 삭제
  async remove(uuid: string): Promise<void> {
    const removed = await this.linkRepository.remove(uuid);

    if (!removed) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${uuid}`);
    }
  }
}
