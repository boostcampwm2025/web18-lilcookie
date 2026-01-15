// src/auth/guards/access-token.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RefreshTokenPayload, AuthenticatedRequest } from "../interfaces/auth.interface";

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies["refreshToken"] as string | undefined;
    if (!token) {
      throw new UnauthorizedException("인증 정보가 없습니다.");
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });

      // 요청 객체에 페이로드 추가
      request.refreshTokenPayload = payload;
      request.rawRefreshToken = token;

      return true;
    } catch {
      throw new UnauthorizedException("인증 정보가 없습니다.");
    }
  }
}
