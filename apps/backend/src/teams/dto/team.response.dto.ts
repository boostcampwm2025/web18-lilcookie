import { Team } from "../entities/team.entity";

/**
 * 팀 응답 DTO
 */
export class TeamResponseDto {
  teamUuid: string;
  teamName: string;
  createdAt: string;
  role: string;

  constructor(data: { teamUuid: string; teamName: string; createdAt: string; role: string }) {
    this.teamUuid = data.teamUuid;
    this.teamName = data.teamName;
    this.createdAt = data.createdAt;
    this.role = data.role;
  }

  static from(team: Team, role: string): TeamResponseDto {
    return new TeamResponseDto({
      teamUuid: team.teamUuid,
      teamName: team.teamName,
      createdAt: team.createdAt.toISOString(),
      role,
    });
  }
}

/**
 * 팀 미리보기 응답 DTO
 */
export class TeamPreviewResponseDto {
  teamName: string;

  constructor(teamName: string) {
    this.teamName = teamName;
  }

  static from(team: Team): TeamPreviewResponseDto {
    return new TeamPreviewResponseDto(team.teamName);
  }
}

/**
 * 팀 가입 응답 DTO
 */
export class TeamJoinResponseDto {
  teamUuid: string;
  teamName: string;
  joinedAt: string;
  role: string;

  constructor(data: { teamUuid: string; teamName: string; joinedAt: string; role: string }) {
    this.teamUuid = data.teamUuid;
    this.teamName = data.teamName;
    this.joinedAt = data.joinedAt;
    this.role = data.role;
  }

  static from(team: Team, joinedAt: Date, role: string): TeamJoinResponseDto {
    return new TeamJoinResponseDto({
      teamUuid: team.teamUuid,
      teamName: team.teamName,
      joinedAt: joinedAt.toISOString(),
      role,
    });
  }
}
