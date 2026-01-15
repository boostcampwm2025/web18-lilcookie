import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthenticatedRequest } from "../interfaces/auth.interface";

export const GetRawToken = createParamDecorator(
  (data: "accessToken" | "refreshToken", ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = data === "accessToken" ? request.rawAccessToken : request.rawRefreshToken;
    if (!token) {
      throw new UnauthorizedException("인증 정보가 없습니다.");
    }
    return token;
  },
);
