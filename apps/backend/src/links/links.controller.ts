import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Inject,
  type LoggerService,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { LinksService } from "./links.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";
import { UpdateLinkRequestDto } from "./dto/update-link.request.dto";
import { LinkResponseDto } from "./dto/link.response.dto";
import { GetLinksQueryDto } from "./dto/get-links-query.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { RequireScopes } from "../oidc/guards/scopes.decorator";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/interfaces/oidc.interface";

@Controller("links")
@UseGuards(OidcGuard)
export class LinksController {
  constructor(
    private readonly linksService: LinksService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * 새로운 링크 생성
   * POST /links
   */
  @Post()
  @RequireScopes("links:write")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() requestDto: CreateLinkRequestDto, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`POST /links - 새로운 링크 생성 요청: ${requestDto.title}`);

    const responseDto = await this.linksService.create(requestDto, user.userId);

    return ResponseBuilder.success<LinkResponseDto>()
      .status(HttpStatus.CREATED)
      .message("링크가 성공적으로 생성되었습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 링크 목록 조회 (전체 또는 조건)
   * GET /links?teamUuid={teamUuid}&folderUuid={folderUuid}&tags={tags}&createdAfter={createdAfter}
   */
  @Get()
  @RequireScopes("links:read")
  async findAll(@Query() query: GetLinksQueryDto, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(
      `GET /links - 링크 목록 조회 요청: teamUuid=${query.teamUuid}, folderUuid=${query.folderUuid}, tags=${query.tags}, createdAfter=${query.createdAfter?.toISOString()}`,
    );

    const responseDtos = await this.linksService.findAll(query, user.userId);

    return ResponseBuilder.success<LinkResponseDto[]>()
      .status(HttpStatus.OK)
      .message("링크들을 성공적으로 조회했습니다.")
      .data(responseDtos)
      .build();
  }

  /**
   * 특정 링크 조회
   * GET /links/:linkUuid
   */
  @Get(":linkUuid")
  @RequireScopes("links:read")
  async findOne(@Param("linkUuid", ParseUUIDPipe) linkUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /links/${linkUuid} - 특정 링크 조회 요청`);

    const responseDto = await this.linksService.findOne(linkUuid, user.userId);

    return ResponseBuilder.success<LinkResponseDto>()
      .status(HttpStatus.OK)
      .message("링크 정보를 성공적으로 조회했습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 특정 링크 수정
   * PATCH /links/:linkUuid
   */
  @Patch(":linkUuid")
  @RequireScopes("links:write")
  async update(
    @Param("linkUuid", ParseUUIDPipe) linkUuid: string,
    @Body() requestDto: UpdateLinkRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`PATCH /links/${linkUuid} - 특정 링크 수정 요청`);

    const responseDto = await this.linksService.update(linkUuid, requestDto, user.userId);

    return ResponseBuilder.success<LinkResponseDto>()
      .status(HttpStatus.OK)
      .message("링크 정보가 성공적으로 수정되었습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 특정 링크 삭제
   * DELETE /links/:linkUuid
   */
  @Delete(":linkUuid")
  @RequireScopes("links:write")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("linkUuid", ParseUUIDPipe) linkUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`DELETE /links/${linkUuid} - 특정 링크 삭제 요청`);

    await this.linksService.remove(linkUuid, user.userId);

    // 204 No Content는 Response Body 없음
    return;
  }
}
