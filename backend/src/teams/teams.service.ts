import { Injectable, ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { TeamRepository } from "./repositories/team.repository";
import { Team, TeamMember } from "./entities/team.entity";
import { TeamRole } from "./enums/team-role.enum";

@Injectable()
export class TeamsService {
  constructor(private readonly teamRepository: TeamRepository) {}

  // 팀 생성 (생성자는 자동으로 owner로 가입)
  async create(name: string, userId: number): Promise<{ team: Team; member: TeamMember }> {
    const team = await this.teamRepository.create(name);
    const member = await this.teamRepository.addMember(team.id, userId, TeamRole.OWNER);

    return { team, member };
  }

  // 내 팀 조회
  async getMyTeams(userId: number): Promise<Array<{ team: Team; role: string }>> {
    return this.teamRepository.findTeamsWithRoleByUserId(userId);
  }

  // 초대 링크용 팀 정보 조회
  async getTeamByUuid(uuid: string): Promise<Team> {
    const team = await this.teamRepository.findByUuid(uuid);
    if (!team) {
      throw new NotFoundException("팀을 찾을 수 없습니다.");
    }
    return team;
  }

  // 팀 가입
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

  // 팀 탈퇴
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

  // 팀 멤버 목록
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
