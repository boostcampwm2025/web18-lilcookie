import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthenticatedRequest } from "../interfaces/auth.interface";

export const GetRawToken = createParamDecorator(
  (data: "accessToken" | "refreshToken", ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = data === "accessToken" ? request.rawAccessToken : request.rawRefreshToken;
    if (!token) {
      // 가드를 지나왔는데 페이로드가 없는 경우는 비정상적인 상황
      throw new UnauthorizedException("인증 정보가 없습니다.");
    }
    return token;
  },
);
