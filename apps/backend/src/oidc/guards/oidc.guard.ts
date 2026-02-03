import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { OidcService } from "../oidc.service";
import type { AuthenticatedRequest } from "../types/oidc.types";
import { UserService } from "../../user/user.service";

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
      throw new UnauthorizedException("Authorization 헤더가 필요합니다.");
    }

    const parts = authorizationHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new UnauthorizedException("유효하지 않은 Authorization 헤더 형식입니다.");
    }

    const token = parts[1];

    try {
      // 토큰 검증 및 페이로드 추출 (issuer 기반 동적 검증)
      const payload = await this.oidcService.validateTokenWithIssuer(token);

      const preferred_username = payload.preferred_username;
      if (!preferred_username) {
        throw new UnauthorizedException("OIDC 토큰에 preferred_username이 필요합니다.");
      }

      const uuid = payload.sub;
      if (!uuid) {
        throw new UnauthorizedException("OIDC 토큰에 sub(사용자 고유 ID)가 필요합니다.");
      }

      const user = await this.userService.findOrCreate(uuid, preferred_username, payload.email);

      /**
       * 요청 객체에 사용자 정보 추가
       * 추가하는 정보들:
       * - OIDC 페이로드의 모든 필드
       * - 우리 데이터베이스에서 조회한 userId, userUuid, userNickname
       */
      request.user = {
        ...payload,
        userId: user.userId,
        userUuid: user.userUuid,
        userNickname: user.userNickname,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("유효하지 않거나 만료된 토큰입니다.");
    }
  }
}
