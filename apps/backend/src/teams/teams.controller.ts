import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Inject,
  type LoggerService,
} from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { CreateTeamRequestDto } from "./dto/create-team.request.dto";
import { TeamResponseDto, TeamPreviewResponseDto, TeamJoinResponseDto } from "./dto/team.response.dto";
import { TeamMemberResponseDto } from "./dto/team-member.response.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/interfaces/oidc.interface";
import { ResponseBuilder } from "../common/builders/response.builder";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Controller("teams")
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * 팀 생성
   * POST /teams
   */
  @Post()
  @UseGuards(OidcGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() requestDto: CreateTeamRequestDto, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`POST /teams - 새로운 팀 생성 요청: ${requestDto.teamName}`);

    const responseDto = await this.teamsService.create(requestDto.teamName, user.userId);

    return ResponseBuilder.success<TeamResponseDto>()
      .status(HttpStatus.CREATED)
      .message("팀이 성공적으로 생성되었습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 내가 속한 모든 팀 조회
   * GET /teams/me
   */
  @Get("me")
  @UseGuards(OidcGuard)
  async getMyTeams(@CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /teams/me - 사용자(${user.userNickname})의 팀 목록 조회 요청`);

    const responseDtos = await this.teamsService.getMyTeams(user.userId);

    return ResponseBuilder.success<TeamResponseDto[]>()
      .status(HttpStatus.OK)
      .message("내 팀 정보를 성공적으로 조회했습니다.")
      .data(responseDtos)
      .build();
  }

  /**
   * 팀 정보 조회 (미리보기용)
   * GET /teams/:teamUuid/preview
   */
  @Get(":teamUuid/preview")
  async getTeamPreview(@Param("teamUuid", ParseUUIDPipe) teamUuid: string) {
    this.logger.log(`GET /teams/${teamUuid}/preview - 팀 정보(미리보기) 조회 요청`);

    const responseDto = await this.teamsService.getTeamByUuid(teamUuid);

    return ResponseBuilder.success<TeamPreviewResponseDto>()
      .status(HttpStatus.OK)
      .message("팀 정보를 성공적으로 조회했습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 팀 가입
   * POST /teams/:teamUuid/join
   */
  @Post(":teamUuid/join")
  @UseGuards(OidcGuard)
  async join(@Param("teamUuid", ParseUUIDPipe) teamUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`POST /teams/${teamUuid}/join - 사용자(${user.userNickname})의 팀 가입 요청`);

    const responseDto = await this.teamsService.join(teamUuid, user.userId);

    return ResponseBuilder.success<TeamJoinResponseDto>()
      .status(HttpStatus.OK)
      .message("팀에 성공적으로 가입되었습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 팀 탈퇴
   * DELETE /teams/:teamUuid
   */
  @Delete(":teamUuid")
  @UseGuards(OidcGuard)
  async leave(@Param("teamUuid", ParseUUIDPipe) teamUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`DELETE /teams/${teamUuid} - 사용자(${user.userNickname})의 팀 탈퇴 요청`);

    await this.teamsService.leave(teamUuid, user.userId);

    return ResponseBuilder.success<Record<string, never>>()
      .status(HttpStatus.OK)
      .message("팀에서 성공적으로 탈퇴되었습니다.")
      .data({})
      .build();
  }

  /**
   * 팀 멤버 조회
   * GET /teams/:teamUuid/members
   */
  @Get(":teamUuid/members")
  @UseGuards(OidcGuard)
  async getMembers(@Param("teamUuid", ParseUUIDPipe) teamUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /teams/${teamUuid}/members - 팀 멤버 조회 요청`);

    const responseDtos = await this.teamsService.getMembers(teamUuid, user.userId);

    return ResponseBuilder.success<TeamMemberResponseDto[]>()
      .status(HttpStatus.OK)
      .message("팀 멤버 정보를 성공적으로 조회했습니다.")
      .data(responseDtos)
      .build();
  }
}
