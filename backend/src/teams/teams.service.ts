import { Injectable, ConflictException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { TeamRepository } from "./repositories/team.repository";
import { Team, TeamMember } from "./entities/team.entity";

@Injectable()
export class TeamsService {
  constructor(private readonly teamRepository: TeamRepository) {}

  // 팀 생성 (생성자는 자동으로 owner로 가입)
  async create(name: string, userId: number): Promise<{ team: Team; member: TeamMember }> {
    // 이미 팀에 속해있는지 확인
    const existingMember = await this.teamRepository.findMemberByUserId(userId);
    if (existingMember) {
      throw new ConflictException("이미 팀에 소속되어 있습니다. 탈퇴 후 새 팀을 생성해주세요.");
    }

    const team = await this.teamRepository.create(name);
    const member = await this.teamRepository.addMember(team.id, userId, "owner");

    return { team, member };
  }

  // 내 팀 조회
  async getMyTeam(userId: number): Promise<{ team: Team; role: string } | null> {
    const member = await this.teamRepository.findMemberByUserId(userId);
    if (!member) {
      return null;
    }

    const team = await this.teamRepository.findByUserId(userId);
    return team ? { team, role: member.role } : null;
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
    // 이미 팀에 속해있는지 확인
    const existingMember = await this.teamRepository.findMemberByUserId(userId);
    if (existingMember) {
      throw new ConflictException("이미 팀에 소속되어 있습니다. 탈퇴 후 가입해주세요.");
    }

    const team = await this.teamRepository.findByUuid(uuid);
    if (!team) {
      throw new NotFoundException("팀을 찾을 수 없습니다.");
    }

    return this.teamRepository.addMember(team.id, userId, "member");
  }

  // 팀 탈퇴
  async leave(userId: number): Promise<void> {
    const member = await this.teamRepository.findMemberByUserId(userId);
    if (!member) {
      throw new NotFoundException("소속된 팀이 없습니다.");
    }

    // owner는 탈퇴 불가
    if (member.role === "owner") {
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
    const member = await this.teamRepository.findMemberByUserId(userId);
    if (!member || member.teamId !== team.id) {
      throw new ForbiddenException("해당 팀의 멤버만 조회할 수 있습니다.");
    }

    return this.teamRepository.findMembersByTeamId(team.id);
  }
}
