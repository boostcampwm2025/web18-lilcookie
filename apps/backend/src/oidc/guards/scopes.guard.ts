import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SCOPES_KEY } from "./scopes.decorator";
import type { AuthenticatedRequest } from "../interfaces/oidc.interface";

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    const tokenScopes = user.scope.split(" ");
    const hasAllScopes = requiredScopes.every((requiredScope) => tokenScopes.includes(requiredScope));

    if (!hasAllScopes) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
