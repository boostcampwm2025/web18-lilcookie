import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { TeamRepository } from "./repositories/team.repository";
import { FolderRepository } from "../folders/repositories/folder.repository";
import { TeamRole } from "./constants/team-role.constants";
import { DEFAULT_FOLDER_NAME } from "../folders/constants/folder.constants";
import { TeamResponseDto, TeamPreviewResponseDto, TeamJoinResponseDto } from "./dto/team.response.dto";
import { TeamMemberResponseDto } from "./dto/team-member.response.dto";
import { UserRepository } from "src/user/user.repository";

@Injectable()
export class TeamsService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly folderRepository: FolderRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * 새로운 팀 생성
   * @param teamName 생성할 팀 이름
   * @param userId 팀을 생성하는 사용자 ID
   * @returns 생성된 팀 응답 DTO
   */
  async create(teamName: string, userId: number): Promise<TeamResponseDto> {
    const team = await this.teamRepository.create(teamName);
    const member = await this.teamRepository.addMember(team.teamId, userId, TeamRole.OWNER);

    // 기본 폴더 자동 생성
    await this.folderRepository.create({
      teamId: team.teamId,
      folderName: DEFAULT_FOLDER_NAME,
      createdBy: userId,
    });

    return TeamResponseDto.from(team, member.role);
  }

  /**
   * 사용자가 속한 팀 목록 조회
   * @param userId 조회할 사용자 ID
   * @returns 팀 응답 DTO 배열
   */
  async getMyTeams(userId: number): Promise<TeamResponseDto[]> {
    const results = await this.teamRepository.findTeamsWithRoleByUserId(userId);
    return results.map(({ team, role }) => TeamResponseDto.from(team, role));
  }

  /**
   * 팀 UUID로 팀 조회
   * @param teamUuid 조회할 팀 UUID
   * @returns 팀 미리보기 응답 DTO
   */
  async getTeamByUuid(teamUuid: string): Promise<TeamPreviewResponseDto> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }
    //프리뷰 용도라서, 권한 검증 안함

    return TeamPreviewResponseDto.from(team);
  }

  /**
   * 팀 UUID로 팀 가입
   * @param teamUuid 가입할 팀 UUID
   * @param userId 가입하는 사용자 ID
   * @returns 팀 가입 응답 DTO
   */
  async join(teamUuid: string, userId: number): Promise<TeamJoinResponseDto> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const existingMember = await this.teamRepository.findMember(team.teamId, userId);
    if (existingMember) {
      throw new ConflictException("이미 해당 팀에 가입되어 있습니다.");
    }

    const member = await this.teamRepository.addMember(team.teamId, userId, TeamRole.MEMBER);
    return TeamJoinResponseDto.from(team, member.joinedAt, member.role);
  }

  /**
   * 팀 탈퇴
   * @param teamUuid 탈퇴할 팀 UUID
   * @param userId 탈퇴하는 사용자 ID
   * @returns void
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
   * @returns 팀 멤버 응답 DTO 배열
   */
  async getMembers(teamUuid: string, userId: number): Promise<TeamMemberResponseDto[]> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new NotFoundException("해당 팀에 소속되어 있지 않습니다.");
    }

    const members = await this.teamRepository.findMembersByTeamId(team.teamId);
    return members.map(({ member, user }) => TeamMemberResponseDto.from(member, user));
  }

  /**
   * 팀 소유권 위임
   * @param teamUuid 팀UUID
   * @param currentUserId 요청한 사용자ID
   * @param targetUserUuid 권한 위임받을 사용자UUID
   * @returns
   */
  async transferOwnership(teamUuid: string, currentUserId: number, targetUserUuid: string): Promise<void> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    // 현재 사용자가 owner인지 확인
    const currentMember = await this.teamRepository.findMember(team.teamId, currentUserId);
    if (!currentMember || currentMember.role !== TeamRole.OWNER) {
      throw new ForbiddenException("팀 소유자만 권한을 위임할 수 있습니다.");
    }

    // 대상 사용자 조회
    const targetUser = await this.userRepository.findByUuid(targetUserUuid);
    if (!targetUser) {
      throw new NotFoundException("대상 사용자를 찾을 수 없습니다.");
    }

    // 자기 자신에게 위임 불가
    if (currentUserId === targetUser.userId) {
      throw new BadRequestException("자기 자신에게 권한을 위임할 수 없습니다.");
    }

    // 대상이 팀 멤버인지 확인
    const targetMember = await this.teamRepository.findMember(team.teamId, targetUser.userId);
    if (!targetMember) {
      throw new NotFoundException("대상 사용자가 팀에 소속되어 있지 않습니다.");
    }

    // 역할 교체
    await this.teamRepository.updateMemberRole(team.teamId, targetUser.userId, TeamRole.OWNER);
    await this.teamRepository.updateMemberRole(team.teamId, currentUserId, TeamRole.MEMBER);
  }

  /**
   * 팀 삭제 (owner가 혼자일 때만)
   */
  async deleteTeam(teamUuid: string, userId: number): Promise<void> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    // owner 권한 확인
    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member || member.role !== TeamRole.OWNER) {
      throw new ForbiddenException("팀 소유자만 팀을 삭제할 수 있습니다.");
    }

    // 팀에 혼자인지 확인
    const memberCount = await this.teamRepository.countMembers(team.teamId);
    if (memberCount > 1) {
      throw new ForbiddenException(
        "다른 팀원이 있을 때는 팀을 삭제할 수 없습니다. 먼저 권한을 위임하거나 팀원이 탈퇴해야 합니다.",
      );
    }

    const deleted = await this.teamRepository.deleteTeam(team.teamId);
    if (!deleted) {
      throw new InternalServerErrorException("팀 삭제 중 오류가 발생했습니다.");
    }
  }
}
