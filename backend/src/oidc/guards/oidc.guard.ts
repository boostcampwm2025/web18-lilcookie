import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { OidcService } from "../oidc.service";
import type { AuthenticatedRequest } from "../interfaces/oidc.interface";
import { UserService } from "src/user/user.service";

@Injectable()
export class OidcGuard implements CanActivate {
  constructor(
    private readonly oidcService: OidcService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException("Authorization header is missing");
    }

    const parts = authorizationHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new UnauthorizedException("Invalid authorization header format");
    }

    const token = parts[1];

    try {
      const payload = await this.oidcService.validateToken(token);

      // DB에서 유저 조회.생성
      const nickname = payload.nickname;
      if (!nickname) {
        throw new UnauthorizedException("OIDC 토큰에 nickname이 필요합니다");
      }
      const user = await this.userService.findOrCreate(payload.sub, nickname);

      request.user = { ...payload, userId: user.id };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
