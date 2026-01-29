import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest, OidcAccessTokenPayload } from "../types/oidc.types";

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): OidcAccessTokenPayload => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
