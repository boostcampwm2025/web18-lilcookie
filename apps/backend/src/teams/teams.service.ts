import { Injectable, ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { TeamRepository } from "./repositories/team.repository";
import { Team, TeamMember } from "./entities/team.entity";
import { TeamRole } from "./constants/team-role.constants";

@Injectable()
export class TeamsService {
  constructor(private readonly teamRepository: TeamRepository) {}

  /**
   * 팀을 생성하고, 생성자를 해당 팀의 owner로 자동 등록한다.
   *
   * @param name 생성할 팀 이름
   * @param userId 팀을 생성하는 사용자 ID
   * @returns 생성된 팀과 팀 멤버(owner) 정보
   */
  async create(name: string, userId: number): Promise<{ team: Team; member: TeamMember }> {
    const team = await this.teamRepository.create(name);
    const member = await this.teamRepository.addMember(team.id, userId, TeamRole.OWNER);

    return { team, member };
  }

  /**
   * 사용자가 소속된 팀 목록과 각 팀에서의 역할을 조회한다.
   *
   * @param userId 조회할 사용자 ID
   * @returns 팀 정보와 역할이 포함된 배열
   */
  async getMyTeams(userId: number): Promise<Array<{ team: Team; role: string }>> {
    return this.teamRepository.findTeamsWithRoleByUserId(userId);
  }

  /**
   * 팀 UUID를 기반으로 팀 정보를 조회한다.
   * 주로 초대 링크 접근 시 사용된다.
   *
   * @param uuid 팀 UUID
   * @throws {NotFoundException} 팀이 존재하지 않을 경우
   * @returns 팀 엔티티
   */
  async getTeamByUuid(uuid: string): Promise<Team> {
    const team = await this.teamRepository.findByUuid(uuid);
    if (!team) {
      throw new NotFoundException("팀을 찾을 수 없습니다.");
    }
    return team;
  }

  /**
   * 초대 링크(UUID)를 통해 팀에 가입한다.
   *
   * @param uuid 가입할 팀 UUID
   * @param userId 가입하는 사용자 ID
   * @throws {NotFoundException} 팀이 존재하지 않을 경우
   * @throws {ConflictException} 이미 해당 팀에 가입된 경우
   * @returns 생성된 팀 멤버 정보
   */
  async join(uuid: string, userId: number): Promise<TeamMember> {
    const team = await this.teamRepository.findByUuid(uuid);
    if (!team) {
      throw new NotFoundException("팀을 찾을 수 없습니다.");
    }

    // 이미 해당 팀에 가입했는지 체크
    const existingMember = await this.teamRepository.findMember(team.id, userId);
    if (existingMember) {
      throw new ConflictException("이미 해당 팀에 가입되어 있습니다.");
    }

    return this.teamRepository.addMember(team.id, userId, TeamRole.MEMBER);
  }

  /**
   * 팀에서 탈퇴한다.
   * 단, 팀 owner는 탈퇴할 수 없다.
   *
   * @param uuid 탈퇴할 팀 UUID
   * @param userId 탈퇴하는 사용자 ID
   * @throws {NotFoundException} 팀 또는 멤버가 존재하지 않을 경우
   * @throws {ForbiddenException} owner가 탈퇴를 시도한 경우
   */
  async leave(uuid: string, userId: number): Promise<void> {
    const team = await this.teamRepository.findByUuid(uuid);
    if (!team) {
      throw new NotFoundException("소속된 팀이 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.id, userId);
    if (!member) {
      throw new NotFoundException("해당 팀에 소속되어 있지 않습니다.");
    }

    // owner는 탈퇴 불가
    if (member.role === TeamRole.OWNER) {
      throw new ForbiddenException("팀 소유자는 탈퇴할 수 없습니다. 팀을 삭제하거나 소유권을 위임해주세요.");
    }

    await this.teamRepository.removeMember(member.teamId, userId);
  }

  /**
   * 팀의 멤버 목록을 조회한다.
   * 해당 팀의 멤버만 조회할 수 있다.
   *
   * @param uuid 조회할 팀 UUID
   * @param userId 요청한 사용자 ID
   * @throws {NotFoundException} 팀이 존재하지 않을 경우
   * @throws {ForbiddenException} 팀 멤버가 아닌 경우
   * @returns 팀 멤버 목록
   */
  async getMembers(uuid: string, userId: number): Promise<TeamMember[]> {
    const team = await this.teamRepository.findByUuid(uuid);
    if (!team) {
      throw new NotFoundException("팀을 찾을 수 없습니다.");
    }

    // 해당 팀 멤버인지 확인
    const member = await this.teamRepository.findMember(team.id, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀의 멤버만 조회할 수 있습니다.");
    }

    return this.teamRepository.findMembersByTeamId(team.id);
  }
}
