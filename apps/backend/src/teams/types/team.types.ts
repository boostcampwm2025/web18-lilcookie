import { Team } from "../entities/team.entity";
import { Member } from "../entities/member.entity";
import { User } from "../../user/entities/user.entity";

/**
 * 팀 멤버와 유저 정보
 */
export interface MemberWithUser {
  member: Member;
  user: User;
}

/**
 * 팀과 멤버 역할
 */
export interface TeamWithRole {
  team: Team;
  role: string;
}

/**
 * 팀 생성 결과
 */
export interface TeamCreateResult {
  team: Team;
  member: Member;
}

/**
 * 팀 가입 결과
 */
export interface TeamJoinResult {
  team: Team;
  member: Member;
}
