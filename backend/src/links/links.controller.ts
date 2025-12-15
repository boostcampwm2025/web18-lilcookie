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
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { LinksService } from "./links.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";
import { CreateLinkResponseDto } from "./dto/create-link.response.dto";
import { LinkResponseDto } from "./dto/link.response.dto";
import { GetLinksQueryDto } from "./dto/get-links-query.dto";

@Controller("links")
export class LinksController {
  constructor(
    private readonly linksService: LinksService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  // 새로운 Link 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() requestDto: CreateLinkRequestDto) {
    this.logger.log(`POST /api/links - 링크 생성 요청: ${requestDto.title}`);

    const link = this.linksService.create(requestDto);
    const responseDto = CreateLinkResponseDto.from(link.linkId, link.createdAt);

    return ResponseBuilder.success<CreateLinkResponseDto>()
      .status(HttpStatus.CREATED)
      .message("링크가 성공적으로 생성되었습니다")
      .data(responseDto)
      .build();
  }

  // 목록 조회 (전체 또는 조건)
  @Get()
  findAll(@Query() requestDto: GetLinksQueryDto) {
    this.logger.log(`GET /api/links - 링크 목록 조회: teamId=${requestDto.teamId}, tags=${requestDto.tags}`);

    const links = this.linksService.findAll(requestDto.teamId, requestDto.tags);
    const responseDtos = links.map((link) => LinkResponseDto.from(link));

    return ResponseBuilder.success<LinkResponseDto[]>()
      .status(HttpStatus.OK)
      .message("링크 목록을 성공적으로 조회했습니다")
      .data(responseDtos)
      .build();
  }

  // 단건 조회
  @Get(":linkId")
  findOne(@Param("linkId") linkId: string) {
    this.logger.log(`GET /api/links/${linkId} - 링크 단건 조회`);

    const link = this.linksService.findOne(linkId);
    const responseDto = LinkResponseDto.from(link);

    return ResponseBuilder.success<LinkResponseDto>()
      .status(HttpStatus.OK)
      .message("링크를 성공적으로 조회했습니다")
      .data(responseDto)
      .build();
  }

  // 단건 삭제
  @Delete(":linkId")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("linkId") linkId: string) {
    this.logger.log(`DELETE /api/links/${linkId} - 링크 단건 삭제`);

    this.linksService.remove(linkId);

    // 204 No Content는 Response Body 없음
    return;
  }
}
