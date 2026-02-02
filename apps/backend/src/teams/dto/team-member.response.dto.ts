import { Member } from "../entities/member.entity";
import { User } from "../../user/entities/user.entity";

/**
 * 팀 멤버 응답 DTO
 */
export class TeamMemberResponseDto {
  userUuid: string;
  userName: string;
  userEmail: string | null;
  role: string;
  joinedAt: string;

  constructor(data: { userUuid: string; userName: string; userEmail: string | null; role: string; joinedAt: string }) {
    this.userUuid = data.userUuid;
    this.userName = data.userName;
    this.userEmail = data.userEmail;
    this.role = data.role;
    this.joinedAt = data.joinedAt;
  }

  static from(member: Member, user: User): TeamMemberResponseDto {
    return new TeamMemberResponseDto({
      userUuid: user.userUuid,
      userName: user.userNickname,
      userEmail: user.userEmail,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
    });
  }
}
