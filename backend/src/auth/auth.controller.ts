import { Controller, Post, Body, HttpStatus, HttpCode, Inject, Res, type LoggerService } from "@nestjs/common";
import type { CookieOptions, Response } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AuthService } from "./auth.service";
import { ResponseBuilder } from "../common/builders/response.builder";
import { SignupRequestDto } from "./dto/signup.request.dto";
import { SignupResponseDto } from "./dto/signup.response.dto";

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

    const { user, accessToken, refreshToken } = await this.authService.signup(signupDto);

    this.setAuthCookies(res, accessToken, refreshToken);

    const responseDto = SignupResponseDto.from(user.uuid, user.email, user.nickname);

    return ResponseBuilder.success<SignupResponseDto>().status(HttpStatus.OK).data(responseDto).build();
  }

  // 쿠키 설정
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);
  }
}
