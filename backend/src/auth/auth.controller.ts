import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Inject,
  Res,
  type LoggerService,
  UseGuards,
  Get,
} from "@nestjs/common";
import type { CookieOptions, Response } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AuthService } from "./auth.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { SignupRequestDto } from "./dto/signup.request.dto";
import { SignupResponseDto } from "./dto/signup.response.dto";
import { LoginRequestDto } from "./dto/login.request.dto";
import { LoginResponseDto } from "./dto/login.response.dto";
import type { AccessTokenPayload, AuthResult, RefreshTokenPayload, TokenInfo } from "./interfaces/auth.interface";
import { AccessTokenGuard } from "./guards/access-token.guard";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { GetAccessToken } from "./decorators/get-access-token.decorator";
import { MeResponseDto } from "./dto/me.response.dto";
import { GetRawToken } from "./decorators/get-raw-token.decorator";
import { GetRefreshToken } from "./decorators/get-refresh-token.decorator";
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Post("signup")
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupDto: SignupRequestDto, @Res({ passthrough: true }) res: Response) {
    this.logger.log(`POST /api/auth/signup - 회원가입 요청: ${signupDto.email}`);

    const authResult = await this.authService.signup(signupDto);
    this.handleAuthResponse(res, authResult);

    return ResponseBuilder.success<SignupResponseDto>()
      .status(HttpStatus.OK)
      .data(SignupResponseDto.from(authResult.user.uuid, authResult.user.email, authResult.user.nickname))
      .build();
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginRequestDto, @Res({ passthrough: true }) res: Response) {
    this.logger.log(`POST /api/auth/login - 로그인 요청: ${loginDto.email}`);

    const authResult = await this.authService.login(loginDto);
    this.handleAuthResponse(res, authResult);

    return ResponseBuilder.success<LoginResponseDto>()
      .status(HttpStatus.OK)
      .data(LoginResponseDto.from(authResult.user.uuid, authResult.user.email, authResult.user.nickname))
      .build();
  }

  @UseGuards(RefreshTokenGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetRefreshToken() refreshTokenPayload: RefreshTokenPayload,
    @GetRawToken("refreshToken") rawRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`POST /api/auth/logout - 로그아웃 요청: ${refreshTokenPayload.sub}`);

    await this.authService.logout(refreshTokenPayload.sub, refreshTokenPayload.jti, rawRefreshToken);

    this.clearAuthCookies(res);

    return ResponseBuilder.success<void>().status(HttpStatus.OK).message("로그아웃을 성공했습니다.").build();
  }

  @UseGuards(AccessTokenGuard)
  @Get("me")
  @HttpCode(HttpStatus.OK)
  async getMe(@GetAccessToken() accessTokenPayload: AccessTokenPayload) {
    this.logger.log(`GET /api/auth/me - 내 정보 요청: ${accessTokenPayload.sub}`);

    const user = await this.authService.getUserByUuid(accessTokenPayload.sub);

    return ResponseBuilder.success<MeResponseDto>()
      .status(HttpStatus.OK)
      .data(MeResponseDto.from(user.uuid, user.email, user.nickname))
      .build();
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetRefreshToken() refreshTokenPayload: RefreshTokenPayload,
    @GetRawToken("refreshToken") rawRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`POST /api/auth/refresh - 토큰 재발급 요청: ${refreshTokenPayload.sub}`);
    const newTokens = await this.authService.refreshTokens(
      refreshTokenPayload.sub,
      refreshTokenPayload.jti,
      rawRefreshToken,
    );

    this.setAuthCookies(res, newTokens.accessTokenInfo, newTokens.refreshTokenInfo);

    return ResponseBuilder.success<void>().status(HttpStatus.OK).message("토큰을 재발급했습니다.").build();
  }

  // --- 헬퍼 메서드 ---

  private handleAuthResponse(res: Response, authResult: AuthResult) {
    this.setAuthCookies(res, authResult.tokens.accessTokenInfo, authResult.tokens.refreshTokenInfo);
  }

  private setAuthCookies(res: Response, accessToken: TokenInfo, refreshToken: TokenInfo) {
    const options: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    };

    res.cookie("accessToken", accessToken.token, {
      ...options,
      path: "/",
      maxAge: Math.max(0, accessToken.expiresAt - Date.now()),
    });

    res.cookie("refreshToken", refreshToken.token, {
      ...options,
      path: "/api/auth", // Refresh Token은 auth 경로에서만 전송
      maxAge: Math.max(0, refreshToken.expiresAt - Date.now()),
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/api/auth" });
  }
}
