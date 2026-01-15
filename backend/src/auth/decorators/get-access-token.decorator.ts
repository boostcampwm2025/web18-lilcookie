import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AccessTokenPayload, AuthenticatedRequest } from "../interfaces/auth.interface";

export const GetAccessToken = createParamDecorator((_data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.accessTokenPayload) {
    // 가드를 지나왔는데 페이로드가 없는 경우는 비정상적인 상황
    throw new UnauthorizedException("인증 정보가 없습니다.");
  }

  return request.accessTokenPayload;
});
