import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { OidcAccessTokenPayload, AuthenticatedRequest } from "../interfaces/oidc.interface";

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): OidcAccessTokenPayload => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
