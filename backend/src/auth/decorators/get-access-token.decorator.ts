import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AccessTokenPayload, AuthenticatedRequest } from "../interfaces/auth.interface";

export const GetAccessToken = createParamDecorator((_data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.accessTokenPayload) {
    throw new UnauthorizedException("인증 정보가 없습니다.");
  }

  return request.accessTokenPayload;
});
