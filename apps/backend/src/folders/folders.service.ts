import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { UpdateFolderRequestDto } from "./dto/update-folder.request.dto";
import { FolderResponseDto } from "./dto/folder.response.dto";
import { FolderRepository } from "./repositories/folder.repository";
import { TeamRepository } from "../teams/repositories/team.repository";
import { DEFAULT_FOLDER_NAME } from "./constants/folder.constants";

@Injectable()
export class FoldersService {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  /**
   * 새로운 폴더 생성
   * @param teamUuid 팀 UUID
   * @param folderName 생성할 폴더 이름
   * @param userId 요청한 사용자 ID
   * @return 생성된 폴더 정보
   */
  async create(teamUuid: string, folderName: string, userId: number): Promise<FolderResponseDto> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    if (folderName === DEFAULT_FOLDER_NAME) {
      throw new ConflictException("해당 폴더는 기본 폴더 이름으로, 사용할 수 없습니다.");
    }

    const result = await this.folderRepository.create({
      teamId: team.teamId,
      folderName,
      createdBy: userId,
    });

    return FolderResponseDto.from(result.folder, result.creator);
  }

  /**
   * 특정 팀의 모든 폴더 조회
   * @param teamUuid 팀 UUID
   * @param userId 요청한 사용자 ID
   * @return 폴더 목록
   */
  async findAllByTeam(teamUuid: string, userId: number): Promise<FolderResponseDto[]> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    const results = await this.folderRepository.findAllByTeam(team.teamId);
    return results.map((result) => FolderResponseDto.from(result.folder, result.creator));
  }

  /**
   * 특정 폴더 조회
   * @param folderUuid 폴더 UUID
   * @param userId 요청한 사용자 ID
   * @return 폴더 정보
   */
  async findOne(folderUuid: string, userId: number): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findByUuid(folderUuid);
    if (!folder) {
      throw new NotFoundException("해당 폴더를 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(folder.folder.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    return FolderResponseDto.from(folder.folder, folder.creator);
  }

  /**
   * 특정 폴더 이름 수정
   * @param folderUuid 폴더 UUID
   * @param requestDto 수정할 폴더 이름 DTO
   * @param userId 요청한 사용자 ID
   * @return 수정된 폴더 정보
   */
  async update(folderUuid: string, requestDto: UpdateFolderRequestDto, userId: number): Promise<FolderResponseDto> {
    const folder = await this.folderRepository.findByUuid(folderUuid);
    if (!folder) {
      throw new NotFoundException("해당 폴더를 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(folder.folder.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    if (folder.folder.folderName === DEFAULT_FOLDER_NAME) {
      throw new BadRequestException("해당 폴더는 기본 폴더로, 이름을 변경할 수 없습니다.");
    }

    if (requestDto.folderName === DEFAULT_FOLDER_NAME) {
      throw new ConflictException("해당 폴더는 기본 폴더 이름으로, 사용할 수 없습니다.");
    }

    const updated = await this.folderRepository.update(folder.folder.folderId, requestDto.folderName);
    if (!updated) {
      throw new InternalServerErrorException("폴더 업데이트 중 오류가 발생했습니다.");
    }

    return FolderResponseDto.from(updated.folder, updated.creator);
  }

  /**
   * 특정 폴더 삭제
   * @param folderUuid 폴더 UUID
   * @param userId 요청한 사용자 ID
   * @return 삭제 성공 여부
   */
  async remove(folderUuid: string, userId: number): Promise<void> {
    const folder = await this.folderRepository.findByUuid(folderUuid);
    if (!folder) {
      throw new NotFoundException("해당 폴더를 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(folder.folder.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    if (folder.folder.folderName === DEFAULT_FOLDER_NAME) {
      throw new ConflictException("해당 폴더는 기본 폴더로, 삭제할 수 없습니다.");
    }

    const removed = await this.folderRepository.remove(folder.folder.folderId);
    if (!removed) {
      throw new InternalServerErrorException("폴더 삭제 중 오류가 발생했습니다.");
    }
  }
}
