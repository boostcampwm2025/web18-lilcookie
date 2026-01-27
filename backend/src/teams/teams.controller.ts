import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpStatus, ParseUUIDPipe } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { CreateTeamRequestDto } from "./dto/create-team.request.dto";
import { TeamResponseDto } from "./dto/team.response.dto";
import { TeamMemberResponseDto } from "./dto/team-member.response.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/interfaces/oidc.interface";
import { ResponseBuilder } from "../common/builders/response.builder";

@Controller("teams")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // 팀 생성
  @Post()
  @UseGuards(OidcGuard)
  async create(@Body() dto: CreateTeamRequestDto, @CurrentUser() user: AuthenticatedUser) {
    const { team, member } = await this.teamsService.create(dto.name, user.userId);
    const responseDto = TeamResponseDto.from(team, member.role);

    return ResponseBuilder.success<TeamResponseDto>()
      .status(HttpStatus.CREATED)
      .message("팀이 성공적으로 생성되었습니다")
      .data(responseDto)
      .build();
  }

  // 내 팀들 조회
  @Get("me")
  @UseGuards(OidcGuard)
  async getMyTeams(@CurrentUser() user: AuthenticatedUser) {
    const results = await this.teamsService.getMyTeams(user.userId);
    const responseDtos = results.map((r) => TeamResponseDto.from(r.team, r.role));

    return ResponseBuilder.success<TeamResponseDto[]>()
      .status(HttpStatus.OK)
      .message("내 팀 정보를 성공적으로 조회했습니다")
      .data(responseDtos)
      .build();
  }

  // 초대 링크용 팀 정보 조회 (가입 전 확인용)
  @Get(":uuid/invite")
  async getTeamForInvite(@Param("uuid", ParseUUIDPipe) uuid: string) {
    const team = await this.teamsService.getTeamByUuid(uuid);

    return ResponseBuilder.success<{ name: string }>()
      .status(HttpStatus.OK)
      .message("팀 정보를 성공적으로 조회했습니다")
      .data({ name: team.name })
      .build();
  }

  // 팀 가입
  @Post(":uuid/join")
  @UseGuards(OidcGuard)
  async join(@Param("uuid", ParseUUIDPipe) uuid: string, @CurrentUser() user: AuthenticatedUser) {
    await this.teamsService.join(uuid, user.userId);
    return ResponseBuilder.success<{ success: true }>()
      .status(HttpStatus.OK)
      .message("팀에 성공적으로 가입했습니다")
      .data({ success: true })
      .build();
  }

  // 팀 탈퇴
  @Delete(":uuid")
  @UseGuards(OidcGuard)
  async leave(@Param("uuid", ParseUUIDPipe) uuid: string, @CurrentUser() user: AuthenticatedUser) {
    await this.teamsService.leave(uuid, user.userId);
    return ResponseBuilder.success<{ success: true }>()
      .status(HttpStatus.OK)
      .message("팀에서 성공적으로 탈퇴했습니다")
      .data({ success: true })
      .build();
  }

  // 팀 멤버 목록
  @Get(":uuid/members")
  @UseGuards(OidcGuard)
  async getMembers(@Param("uuid", ParseUUIDPipe) uuid: string, @CurrentUser() user: AuthenticatedUser) {
    const members = await this.teamsService.getMembers(uuid, user.userId);
    const responseDtos = members.map((member) => TeamMemberResponseDto.from(member));
    return ResponseBuilder.success<TeamMemberResponseDto[]>()
      .status(HttpStatus.OK)
      .message("팀 멤버 목록을 성공적으로 조회했습니다")
      .data(responseDtos)
      .build();
  }
}
