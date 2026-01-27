import { TeamMember } from "../entities/team.entity";

export class TeamMemberResponseDto {
  userId: number;
  role: string;
  joinedAt: Date;

  static from(member: TeamMember): TeamMemberResponseDto {
    const dto = new TeamMemberResponseDto();
    dto.userId = member.userId;
    dto.role = member.role;
    dto.joinedAt = member.joinedAt;
    return dto;
  }
}
