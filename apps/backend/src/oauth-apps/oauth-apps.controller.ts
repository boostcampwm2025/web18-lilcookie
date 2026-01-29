import {
  Controller,
  Get,
  Post,
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
import { OAuthAppsService } from "./oauth-apps.service";
import { CreateOAuthAppRequestDto } from "./dto/create-oauth-app.request.dto";
import { OAuthAppResponseDto, OAuthAppCreatedResponseDto } from "./dto/oauth-app.response.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/types/oidc.types";
import { ResponseBuilder } from "../common/builders/response.builder";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Controller("oauth-apps")
@UseGuards(OidcGuard)
export class OAuthAppsController {
  constructor(
    private readonly oauthAppsService: OAuthAppsService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * 새 OAuth App 생성
   * POST /oauth-apps
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() requestDto: CreateOAuthAppRequestDto, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`POST /oauth-apps - OAuth App 생성 요청: ${requestDto.name}`);

    const responseDto = await this.oauthAppsService.create(requestDto.name, requestDto.redirectUris, user.userId);

    return ResponseBuilder.success<OAuthAppCreatedResponseDto>()
      .status(HttpStatus.CREATED)
      .message("OAuth App이 생성되었습니다. Client Secret은 이 응답에서만 확인할 수 있으니 안전하게 보관하세요.")
      .data(responseDto)
      .build();
  }

  /**
   * 내 OAuth App 목록 조회
   * GET /oauth-apps
   */
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /oauth-apps - OAuth App 목록 조회`);

    const responseDtos = await this.oauthAppsService.findAll(user.userId);

    return ResponseBuilder.success<OAuthAppResponseDto[]>()
      .status(HttpStatus.OK)
      .message("OAuth App 목록을 조회했습니다.")
      .data(responseDtos)
      .build();
  }

  /**
   * OAuth App 삭제
   * DELETE /oauth-apps/:oauthAppUuid
   */
  @Delete(":oauthAppUuid")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("oauthAppUuid", ParseUUIDPipe) oauthAppUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`DELETE /oauth-apps/${oauthAppUuid} - OAuth App 삭제 요청`);

    await this.oauthAppsService.delete(oauthAppUuid, user.userId);
  }
}
