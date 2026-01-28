import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";
import { UpdateLinkRequestDto } from "./dto/update-link.request.dto";
import { LinkResponseDto } from "./dto/link.response.dto";
import { NotificationService } from "../notification/notification.service";
import { LinkNotificationDto } from "../notification/dto/link-notification.dto";
import { LinkRepository } from "./repositories/link.repository";
import { TeamRepository } from "../teams/repositories/team.repository";
import { FolderRepository } from "../folders/repositories/folder.repository";
import { GetLinksQueryDto } from "./dto/get-links-query.dto";
import { LinkMapper } from "./mappers/link.mapper";
import { Folder } from "../folders/entities/folder.entity";
import { Team } from "../teams/entities/team.entity";

/**
 * 디폴트로 설정된 슬랙 채널 ID (임시 하드코딩)
 */
const DEFAULT_SLACK_CHANNEL_ID = "C0A6S6AM1K7";

@Injectable()
export class LinksService {
  constructor(
    private readonly linkRepository: LinkRepository,
    private readonly notificationService: NotificationService,
    private readonly teamRepository: TeamRepository,
    private readonly folderRepository: FolderRepository,
  ) {}

  /**
   * 새로운 링크 생성
   * @param requestDto 생성 요청 DTO
   * @param userId 요청한 사용자 ID
   * @return 생성된 링크 정보
   */
  async create(requestDto: CreateLinkRequestDto, userId: number): Promise<LinkResponseDto> {
    const team = await this.teamRepository.findByUuid(requestDto.teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    // 폴더 ID 결정: 지정된 폴더 또는 기본 폴더
    const folderId = await this.resolveFolderId(requestDto.folderUuid, team.teamId);

    const { link, creator } = await this.linkRepository.create({
      teamId: team.teamId,
      folderId,
      url: requestDto.url,
      title: requestDto.title,
      tags: JSON.stringify(requestDto.tags),
      summary: requestDto.summary,
      createdBy: userId,
    });

    // 비동기 알림 전송 (실패해도 무시)
    this.notificationService
      .notifyLinkCreated(LinkNotificationDto.fromLink(link, DEFAULT_SLACK_CHANNEL_ID))
      .catch(() => {});

    return LinkMapper.toResponse(link, creator);
  }

  /**
   * 조건에 맞는 링크들 조회
   * @param query 조회 쿼리 DTO
   * @param userId 요청한 사용자 ID
   * @return 링크 응답 DTO 배열
   */
  async findAll(query: GetLinksQueryDto, userId: number): Promise<LinkResponseDto[]> {
    // 팀 권한 검증 및 teamId / teamIds 취득
    const { teamId, teamIds } = await this.validateAndGetTeamIds(query.teamUuid, userId);

    // 폴더 권한 검증 및 folderId 취득
    const folderId = await this.validateAndGetFolderId(query.folderUuid, teamId, teamIds, userId);

    const tags = query.tags?.split(",").map((t) => t.trim());

    const results = await this.linkRepository.findAll({
      teamId,
      teamIds,
      folderId,
      tags,
    });

    return results.map(({ link, creator }) => LinkMapper.toResponse(link, creator));
  }

  /**
   * 팀 권한 검증 및 teamId / teamIds 취득
   * @param teamUuid 팀 UUID (없는 경우 모든 팀 조회)
   * @param userId 요청한 사용자 ID
   * @returns teamId (특정 팀 지정 시) 또는 teamIds (모든 팀 조회 시)
   */
  private async validateAndGetTeamIds(
    teamUuid: string | undefined,
    userId: number,
  ): Promise<{ teamId?: number; teamIds?: number[] }> {
    if (!teamUuid) {
      // teamUuid가 없기에, 사용자가 속해있는 모든 팀 조회
      const userTeams = await this.teamRepository.findTeamsWithRoleByUserId(userId);
      const teamIds = userTeams.map((t) => t.team.teamId);

      return { teamIds };
    }

    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    // teamUuid가 제공되었기에, 해당 팀에 대한 접근 권한 검증
    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    return { teamId: team.teamId };
  }

  /**
   * 폴더 권한 검증 및 folderId 취득
   * @param folderUuid 폴더 UUID (없는 경우 폴더 미지정)
   * @param teamId 특정 팀 ID (있는 경우)
   * @param teamIds 특정 팀 ID 배열 (있는 경우)
   * @param userId 요청한 사용자 ID
   * @returns folderId 또는 undefined (폴더 미지정 시)
   */
  private async validateAndGetFolderId(
    folderUuid: string | undefined,
    teamId: number | undefined,
    teamIds: number[] | undefined,
    userId: number,
  ): Promise<number | undefined> {
    if (!folderUuid) {
      return undefined;
    }

    const folder = await this.folderRepository.findByUuid(folderUuid);
    if (!folder) {
      throw new NotFoundException("해당 폴더를 찾을 수 없습니다.");
    }

    const folderTeamId = folder.folder.teamId;

    // 해당 폴더가 속해있는 팀에 사용자가 속해있는지 확인
    const member = await this.teamRepository.findMember(folderTeamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    // 지정한 팀과 폴더가 속해있는 팀이 일치하는지 확인
    if (teamId && folderTeamId !== teamId) {
      throw new BadRequestException("해당 팀에 속해있는 폴더가 아닙니다.");
    }

    // 지정한 팀들과 폴더가 속해있는 팀이 일치하는지 확인
    if (teamIds && teamIds.length > 0 && !teamIds.includes(folderTeamId)) {
      throw new BadRequestException("해당 팀에 속해있는 폴더가 아닙니다.");
    }

    return folder.folder.folderId;
  }

  /**
   * 특정 링크 조회
   * @param linkUuid 링크 UUID
   * @param userId 요청한 사용자 ID
   * @return 링크 응답 DTO
   */
  async findOne(linkUuid: string, userId: number): Promise<LinkResponseDto> {
    const link = await this.linkRepository.findByUuid(linkUuid);
    if (!link) {
      throw new NotFoundException("해당 링크를 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(link.link.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    return LinkMapper.toResponse(link.link, link.creator);
  }

  /**
   * 특정 링크 수정
   * @param linkUuid 링크 UUID
   * @param requestDto 수정 요청 DTO
   * @param userId 요청한 사용자 ID
   * @return 수정된 링크 정보
   */
  async update(linkUuid: string, requestDto: UpdateLinkRequestDto, userId: number): Promise<LinkResponseDto> {
    const link = await this.linkRepository.findByUuid(linkUuid);
    if (!link) {
      throw new NotFoundException("해당 링크를 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(link.link.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    // 팀 UUID -> ID 변환 (있는 경우)
    let updateTeam: Team | undefined;
    if (requestDto.teamUuid) {
      const team = await this.teamRepository.findByUuid(requestDto.teamUuid);
      if (!team) {
        throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
      }

      const teamMember = await this.teamRepository.findMember(team.teamId, userId);
      if (!teamMember) {
        throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
      }

      updateTeam = team;
    }

    // 폴더 UUID → ID 변환 (있는 경우)
    let updateFolder: Folder | undefined;
    if (requestDto.folderUuid) {
      const folder = await this.folderRepository.findByUuid(requestDto.folderUuid);
      if (!folder) {
        throw new NotFoundException("해당 폴더를 찾을 수 없습니다.");
      }

      const folderTeamMember = await this.teamRepository.findMember(folder.folder.teamId, userId);
      if (!folderTeamMember) {
        throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
      }

      updateFolder = folder.folder;
    }

    if (updateTeam && !updateFolder) {
      // 팀만 변경되고, 폴더가 지정되지 않는 경우, 해당 팀의 기본 폴더로 설정
      const defaultFolderId = await this.getDefaultFolder(updateTeam.teamId);
      updateFolder = new Folder({ folderId: defaultFolderId });
    } else if (!updateTeam && updateFolder) {
      // 폴더만 지정되고, 팀이 변경되지 않는 경우, 폴더의 팀과 링크의 팀이 일치하는지 확인
      if (updateFolder.teamId !== link.link.teamId) {
        throw new BadRequestException("해당 팀에 속해있는 폴더가 아닙니다.");
      }
    } else if (updateTeam && updateFolder) {
      // 팀과 폴더가 모두 지정된 경우, 폴더가 지정된 팀에 속해있는지 확인
      if (updateFolder.teamId !== updateTeam.teamId) {
        throw new BadRequestException("해당 팀에 속해있는 폴더가 아닙니다.");
      }
    }

    const updated = await this.linkRepository.update(link.link.linkId, {
      teamId: updateTeam?.teamId,
      folderId: updateFolder?.folderId,
      url: requestDto.url,
      title: requestDto.title,
      tags: requestDto.tags ? JSON.stringify(requestDto.tags) : undefined,
      summary: requestDto.summary,
    });

    if (!updated) {
      throw new InternalServerErrorException("링크 수정 중 오류가 발생했습니다.");
    }

    return LinkMapper.toResponse(updated.link, updated.creator);
  }

  /**
   * 특정 링크 삭제
   * @param linkUuid 링크 UUID
   * @param userId 요청한 사용자 ID
   * @return 삭제 완료
   */
  async remove(linkUuid: string, userId: number): Promise<void> {
    const link = await this.linkRepository.findByUuid(linkUuid);
    if (!link) {
      throw new NotFoundException("해당 링크를 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(link.link.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    const removed = await this.linkRepository.remove(link.link.linkId);
    if (!removed) {
      throw new InternalServerErrorException("링크 삭제 중 오류가 발생했습니다.");
    }
  }

  /**
   * 폴더 UUID를 폴더 ID로 변환
   * 폴더 UUID가 없으면 기본 폴더 ID 반환
   * @param folderUuid 폴더 UUID
   * @param teamId 팀 ID
   * @returns 폴더 ID
   */
  private async resolveFolderId(folderUuid: string | undefined, teamId: number): Promise<number> {
    if (folderUuid) {
      const folder = await this.folderRepository.findByUuid(folderUuid);
      if (!folder) {
        throw new NotFoundException("해당 폴더를 찾을 수 없습니다.");
      }

      if (folder.folder.teamId !== teamId) {
        throw new BadRequestException("해당 팀에 속해있는 폴더가 아닙니다.");
      }

      return folder.folder.folderId;
    }

    // 기본 폴더 조회
    return this.getDefaultFolder(teamId);
  }

  /**
   * 팀의 기본 폴더 ID 조회
   * @param teamId 팀 ID
   * @returns 기본 폴더 ID
   */
  private async getDefaultFolder(teamId: number): Promise<number> {
    const defaultFolder = await this.folderRepository.findDefaultFolderByTeamId(teamId);
    if (!defaultFolder) {
      // 기본 폴더가 없으면 안되는데, 진짜 잘못된 상태
      throw new InternalServerErrorException("팀의 기본 폴더를 찾을 수 없습니다.");
    }

    return defaultFolder.folderId;
  }
}
