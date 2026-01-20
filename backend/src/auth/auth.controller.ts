import { Controller, HttpStatus, HttpCode, Inject, type LoggerService, UseGuards, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AuthService } from "./auth.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { MeResponseDto } from "./dto/me.response.dto";
import { AuthentikJwtGuard } from "./guards/authentik-jwt.guard";
import type { AuthentikJwtPayload } from "./strategies/authentik-jwt.strategy";

// Request에 user 타입 추가
interface AuthenticatedRequest extends Request {
  user: AuthentikJwtPayload;
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * 내 정보 조회
   * - Authentik 토큰 검증 후 유저 정보 반환
   * - 첫 로그인 시 유저 자동 생성
   */
  @UseGuards(AuthentikJwtGuard)
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: AuthenticatedRequest) {
    const payload = req.user;
    this.logger.log(`GET /api/auth/me - 내 정보 요청: ${payload.sub}`);

    // 유저 조회 또는 생성 (첫 로그인 시)
    const user = await this.authService.findOrCreateUser(payload);

    return ResponseBuilder.success<MeResponseDto>()
      .status(HttpStatus.OK)
      .data(MeResponseDto.from(user.authentikId, user.email, user.nickname))
      .build();
  }
}
