import { Controller, Post, Get, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { CreateTeamRequestDto } from "./dto/create-team.request.dto";
import { TeamResponseDto } from "./dto/team.response.dto";
import { TeamMemberResponseDto } from "./dto/team-member.response.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/interfaces/oidc.interface";

@Controller("teams")
@UseGuards(OidcGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // 팀 생성
  @Post()
  async create(@Body() dto: CreateTeamRequestDto, @CurrentUser() user: AuthenticatedUser): Promise<TeamResponseDto> {
    const { team, member } = await this.teamsService.create(dto.name, user.userId);
    return TeamResponseDto.from(team, member.role);
  }

  // 내 팀 조회
  @Get("me")
  async getMyTeam(@CurrentUser() user: AuthenticatedUser): Promise<TeamResponseDto | null> {
    const result = await this.teamsService.getMyTeam(user.userId);
    return result ? TeamResponseDto.from(result.team, result.role) : null;
  }

  // 초대 링크용 팀 정보 조회 (가입 전 확인용)
  @Get(":uuid/invite")
  async getTeamForInvite(@Param("uuid") uuid: string): Promise<{ name: string }> {
    const team = await this.teamsService.getTeamByUuid(uuid);
    return { name: team.name };
  }

  // 팀 가입
  @Post(":uuid/join")
  async join(@Param("uuid") uuid: string, @CurrentUser() user: AuthenticatedUser): Promise<{ success: boolean }> {
    await this.teamsService.join(uuid, user.userId);
    return { success: true };
  }

  // 팀 탈퇴
  @Delete("me")
  async leave(@CurrentUser() user: AuthenticatedUser): Promise<{ success: boolean }> {
    await this.teamsService.leave(user.userId);
    return { success: true };
  }

  // 팀 멤버 목록
  @Get(":uuid/members")
  async getMembers(
    @Param("uuid") uuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TeamMemberResponseDto[]> {
    const members = await this.teamsService.getMembers(uuid, user.userId);
    return members.map((member) => TeamMemberResponseDto.from(member));
  }
}
