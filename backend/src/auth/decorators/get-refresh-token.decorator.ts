import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { RefreshTokenPayload, AuthenticatedRequest } from "../interfaces/auth.interface";

export const GetRefreshToken = createParamDecorator((_data: unknown, ctx: ExecutionContext): RefreshTokenPayload => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.refreshTokenPayload) {
    throw new UnauthorizedException("인증 정보가 없습니다.");
  }

  return request.refreshTokenPayload;
});
