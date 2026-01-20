import { Controller, Post, Body, HttpStatus, HttpCode, Inject, type LoggerService, UseGuards } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AiService } from "./ai.service";
import { SummarizeRequestDto } from "./dto/summarize.request.dto";
import { SummarizeResponseDto } from "./dto/summarize.response.dto";
import { ResponseBuilder } from "../common/builders/response.builder";
import { OidcGuard } from "../oidc/guards/oidc.guard";
import { RequireScopes } from "../oidc/guards/scopes.decorator";

@Controller("ai")
@UseGuards(OidcGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Post("summary")
  @RequireScopes("ai:use")
  @HttpCode(HttpStatus.OK)
  async summarize(@Body() requestDto: SummarizeRequestDto) {
    this.logger.log(`POST /api/ai/summary - 내용 요약 요청 (길이: ${requestDto.content.length}자)`);

    const result = await this.aiService.summarizeContent(requestDto);
    const responseDto = SummarizeResponseDto.from(result.tags, result.summary);

    this.logger.log(
      `POST /api/ai/summary - 요약 완료 (태그 수: ${result.tags.length}, 요약 길이: ${result.summary.length}자)`,
    );

    return ResponseBuilder.success<SummarizeResponseDto>()
      .status(HttpStatus.OK)
      .message("내용이 성공적으로 요약되었습니다")
      .data(responseDto)
      .build();
  }
}
