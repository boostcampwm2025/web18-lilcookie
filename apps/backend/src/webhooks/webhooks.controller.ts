import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Inject,
  type LoggerService,
} from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { CreateWebhookRequestDto } from "./dto/create-webhook.request.dto";
import { WebhookResponseDto } from "./dto/webhook.response.dto";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { CurrentUser } from "../oidc/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../oidc/interfaces/oidc.interface";
import { ResponseBuilder } from "../common/builders/response.builder";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Controller("teams/:teamUuid/webhooks")
@UseGuards(OidcGuard)
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * 팀의 웹훅 목록 조회
   * GET /teams/:teamUuid/webhooks
   */
  @Get()
  async findAll(@Param("teamUuid", ParseUUIDPipe) teamUuid: string, @CurrentUser() user: AuthenticatedUser) {
    this.logger.log(`GET /teams/${teamUuid}/webhooks - 웹훅 목록 조회`);

    const webhooks = await this.webhooksService.findByTeam(teamUuid, user.userId);

    return ResponseBuilder.success<WebhookResponseDto[]>()
      .status(HttpStatus.OK)
      .message("웹훅 목록을 조회했습니다.")
      .data(webhooks)
      .build();
  }

  /**
   * 웹훅 등록
   * POST /teams/:teamUuid/webhooks
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param("teamUuid", ParseUUIDPipe) teamUuid: string,
    @Body() requestDto: CreateWebhookRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`POST /teams/${teamUuid}/webhooks - 웹훅 등록`);

    const responseDto = await this.webhooksService.create(teamUuid, requestDto.url, user.userId);

    return ResponseBuilder.success<WebhookResponseDto>()
      .status(HttpStatus.CREATED)
      .message("웹훅이 등록되었습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 웹훅 삭제
   * DELETE /teams/:teamUuid/webhooks/:webhookUuid
   */
  @Delete(":webhookUuid")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("teamUuid", ParseUUIDPipe) teamUuid: string,
    @Param("webhookUuid", ParseUUIDPipe) webhookUuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`DELETE /teams/${teamUuid}/webhooks/${webhookUuid} - 웹훅 삭제`);

    await this.webhooksService.delete(teamUuid, webhookUuid, user.userId);

    // 204 No Content는 Response Body 없음
    return;
  }

  /**
   * 웹훅 활성화
   * PATCH /teams/:teamUuid/webhooks/:webhookUuid/activate
   */
  @Patch(":webhookUuid/activate")
  async activate(
    @Param("teamUuid", ParseUUIDPipe) teamUuid: string,
    @Param("webhookUuid", ParseUUIDPipe) webhookUuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`PATCH /teams/${teamUuid}/webhooks/${webhookUuid}/activate - 웹훅 활성화`);

    const responseDto = await this.webhooksService.setActive(teamUuid, webhookUuid, user.userId, true);

    return ResponseBuilder.success<WebhookResponseDto>()
      .status(HttpStatus.OK)
      .message("웹훅이 활성화되었습니다.")
      .data(responseDto)
      .build();
  }

  /**
   * 웹훅 비활성화
   * PATCH /teams/:teamUuid/webhooks/:webhookUuid/deactivate
   */
  @Patch(":webhookUuid/deactivate")
  async deactivate(
    @Param("teamUuid", ParseUUIDPipe) teamUuid: string,
    @Param("webhookUuid", ParseUUIDPipe) webhookUuid: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`PATCH /teams/${teamUuid}/webhooks/${webhookUuid}/deactivate - 웹훅 비활성화`);

    const responseDto = await this.webhooksService.setActive(teamUuid, webhookUuid, user.userId, false);

    return ResponseBuilder.success<WebhookResponseDto>()
      .status(HttpStatus.OK)
      .message("웹훅이 비활성화되었습니다.")
      .data(responseDto)
      .build();
  }
}
