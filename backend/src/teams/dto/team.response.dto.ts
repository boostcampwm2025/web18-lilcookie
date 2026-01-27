import { Team } from "../entities/team.entity";

export class TeamResponseDto {
  uuid: string;
  name: string;
  createdAt: Date;
  role: string;

  static from(team: Team, role: string): TeamResponseDto {
    const dto = new TeamResponseDto();
    dto.uuid = team.uuid;
    dto.name = team.name;
    dto.createdAt = team.createdAt;
    dto.role = role;
    return dto;
  }
}
