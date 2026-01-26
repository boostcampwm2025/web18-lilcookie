import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Inject,
  type LoggerService,
  UseGuards,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { LinksService } from "./links.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";
import { CreateLinkResponseDto } from "./dto/create-link.response.dto";
import { LinkResponseDto } from "./dto/link.response.dto";
import { GetLinksQueryDto } from "./dto/get-links-query.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { TeamGuard } from "../oidc/guards/team.guard";
import { RequireScopes } from "../oidc/guards/scopes.decorator";

@Controller("links")
@UseGuards(OidcGuard, TeamGuard)
export class LinksController {
  constructor(
    private readonly linksService: LinksService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  // 새로운 Link 생성
  @Post()
  @RequireScopes("links:write")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() requestDto: CreateLinkRequestDto) {
    this.logger.log(`POST /api/links - 링크 생성 요청: ${requestDto.title}`);

    const link = await this.linksService.create(requestDto);
    const responseDto = CreateLinkResponseDto.from(link.id, link.createdAt);

    return ResponseBuilder.success<CreateLinkResponseDto>()
      .status(HttpStatus.CREATED)
      .message("링크가 성공적으로 생성되었습니다")
      .data(responseDto)
      .build();
  }

  // 목록 조회 (전체 또는 조건)
  @Get()
  @RequireScopes("links:read")
  async findAll(@Query() requestDto: GetLinksQueryDto) {
    this.logger.log(
      `GET /api/links - 링크 목록 조회: teamId=${requestDto.teamId}, tags=${requestDto.tags}, createdAfter=${requestDto.createdAfter}`,
    );

    const links = await this.linksService.findAll(requestDto.teamId, requestDto.tags, requestDto.createdAfter);
    const responseDtos = links.map((link) => LinkResponseDto.from(link));

    return ResponseBuilder.success<LinkResponseDto[]>()
      .status(HttpStatus.OK)
      .message("링크 목록을 성공적으로 조회했습니다")
      .data(responseDtos)
      .build();
  }

  // 단건 조회
  @Get(":linkId")
  @RequireScopes("links:read")
  async findOne(@Param("linkId") linkId: string) {
    this.logger.log(`GET /api/links/${linkId} - 링크 단건 조회`);

    const link = await this.linksService.findOne(linkId);
    const responseDto = LinkResponseDto.from(link);

    return ResponseBuilder.success<LinkResponseDto>()
      .status(HttpStatus.OK)
      .message("링크를 성공적으로 조회했습니다")
      .data(responseDto)
      .build();
  }

  // 단건 삭제
  @Delete(":linkId")
  @RequireScopes("links:write")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("linkId") linkId: string) {
    this.logger.log(`DELETE /api/links/${linkId} - 링크 단건 삭제`);

    await this.linksService.remove(linkId);

    // 204 No Content는 Response Body 없음
    return;
  }
}
