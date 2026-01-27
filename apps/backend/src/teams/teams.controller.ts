import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpStatus, ParseUUIDPipe } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { TeamMemberResponseDto } from "./dto/team-member.response.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/interfaces/oidc.interface";
import { ResponseBuilder } from "../common/builders/response.builder";
import { ZodValidationPipe } from "src/common/zod-validation.pipe";
import {
  CreateTeamRequestSchema,
  JoinTeamResponseData,
  PreviewTeamResponeData,
  TeamResponseData,
  type CreateTeamRequest,
} from "@repo/shared";

@Controller("teams")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // 팀 생성
  @Post()
  @UseGuards(OidcGuard)
  async create(
    @Body(new ZodValidationPipe(CreateTeamRequestSchema)) body: CreateTeamRequest,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { team, member } = await this.teamsService.create(body.teamName, user.userId);
    const data: TeamResponseData = {
      teamUuid: team.uuid,
      teamName: team.name,
      createdAt: team.createdAt.toISOString(),
      role: member.role as TeamResponseData["role"],
    };

    return ResponseBuilder.success<TeamResponseData>()
      .status(HttpStatus.CREATED)
      .message("팀이 성공적으로 생성되었습니다")
      .data(data)
      .build();
  }

  // 내 팀들 조회
  @Get("me")
  @UseGuards(OidcGuard)
  async getMyTeams(@CurrentUser() user: AuthenticatedUser) {
    const results = await this.teamsService.getMyTeams(user.userId);
    const data: TeamResponseData[] = results.map((r) => ({
      teamUuid: r.team.uuid,
      teamName: r.team.name,
      createdAt: r.team.createdAt.toISOString(),
      role: r.role as TeamResponseData["role"],
    }));
    return ResponseBuilder.success<TeamResponseData[]>()
      .status(HttpStatus.OK)
      .message("내 팀 정보를 성공적으로 조회했습니다")
      .data(data)
      .build();
  }

  // 초대 링크용 팀 정보 조회 (가입 전 확인용)
  @Get(":uuid/invite")
  async getTeamForInvite(@Param("uuid", ParseUUIDPipe) uuid: string) {
    const team = await this.teamsService.getTeamByUuid(uuid);

    return ResponseBuilder.success<PreviewTeamResponeData>()
      .status(HttpStatus.OK)
      .message("팀 정보를 성공적으로 조회했습니다")
      .data({ teamName: team.name })
      .build();
  }

  // 팀 가입
  @Post(":uuid/join")
  @UseGuards(OidcGuard)
  async join(@Param("uuid", ParseUUIDPipe) uuid: string, @CurrentUser() user: AuthenticatedUser) {
    const { team, member } = await this.teamsService.join(uuid, user.userId);
    const data: JoinTeamResponseData = {
      teamUuid: team.uuid,
      teamName: team.name,
      joinedAt: member.joinedAt.toISOString(),
      role: member.role as JoinTeamResponseData["role"],
    };
    return ResponseBuilder.success<JoinTeamResponseData>()
      .status(HttpStatus.OK)
      .message("팀에 성공적으로 가입했습니다")
      .data(data)
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
