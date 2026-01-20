import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { OidcTokenPayload, AuthenticatedRequest } from "../interfaces/oidc.interface";

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): OidcTokenPayload => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
