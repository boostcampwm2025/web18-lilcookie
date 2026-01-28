import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { TeamRepository } from "./repositories/team.repository";
import { FolderRepository } from "../folders/repositories/folder.repository";
import { Team } from "./entities/team.entity";
import { TeamRole } from "./constants/team-role.constants";
import { TeamCreateResult, TeamJoinResult, MemberWithUser, TeamWithRole } from "./types/team.types";
import { DEFAULT_FOLDER_NAME } from "../folders/constants/folder.constants";

@Injectable()
export class TeamsService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly folderRepository: FolderRepository,
  ) {}

  /**
   * 새로운 팀 생성
   * @param teamName 생성할 팀 이름
   * @param userId 팀을 생성하는 사용자 ID
   * @returns 생성된 팀과 멤버 정보
   */
  async create(teamName: string, userId: number): Promise<TeamCreateResult> {
    const team = await this.teamRepository.create(teamName);
    const member = await this.teamRepository.addMember(team.teamId, userId, TeamRole.OWNER);

    // 기본 폴더 자동 생성
    await this.folderRepository.create({
      teamId: team.teamId,
      folderName: DEFAULT_FOLDER_NAME,
      createdBy: userId,
    });

    return { team, member };
  }

  /**
   * 사용자가 속한 팀 목록 조회
   * @param userId 조회할 사용자 ID
   * @returns 팀과 해당 사용자의 역할 정보 배열
   */
  async getMyTeams(userId: number): Promise<TeamWithRole[]> {
    return this.teamRepository.findTeamsWithRoleByUserId(userId);
  }

  /**
   * 팀 UUID로 팀 조회
   * @param teamUuid 조회할 팀 UUID
   * @returns 팀 엔티티
   */
  async getTeamByUuid(teamUuid: string): Promise<Team> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }
    //프리뷰 용도라서, 권한 검증 안함

    return team;
  }

  /**
   * 팀 UUID로 팀 가입
   * @param teamUuid 가입할 팀 UUID
   * @param userId 가입하는 사용자 ID
   * @returns 가입된 팀과 멤버 정보
   */
  async join(teamUuid: string, userId: number): Promise<TeamJoinResult> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const existingMember = await this.teamRepository.findMember(team.teamId, userId);
    if (existingMember) {
      throw new ConflictException("이미 해당 팀에 가입되어 있습니다.");
    }

    const member = await this.teamRepository.addMember(team.teamId, userId, TeamRole.MEMBER);
    return { team, member };
  }

  /**
   * 팀 탈퇴
   * @param teamUuid 탈퇴할 팀 UUID
   * @param userId 탈퇴하는 사용자 ID
   * @Returns void
   */
  async leave(teamUuid: string, userId: number): Promise<void> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("현재 가입된 팀이 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new NotFoundException("해당 팀에 소속되어 있지 않습니다.");
    }

    // owner는 탈퇴 불가
    if (member.role === TeamRole.OWNER) {
      throw new ForbiddenException("팀 소유자는 탈퇴할 수 없습니다. 팀을 삭제하거나 소유권을 위임해주세요.");
    }

    const removed = await this.teamRepository.removeMember(team.teamId, userId);
    if (!removed) {
      throw new InternalServerErrorException("팀 탈퇴 중 오류가 발생했습니다.");
    }
  }

  /**
   * 팀 멤버 조회
   * @param teamUuid 팀 UUID
   * @param userId 요청한 사용자 ID
   * @returns 멤버와 유저 정보 배열
   */
  async getMembers(teamUuid: string, userId: number): Promise<MemberWithUser[]> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new NotFoundException("해당 팀에 소속되어 있지 않습니다.");
    }

    return this.teamRepository.findMembersByTeamId(team.teamId);
  }
}
