import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { AuthenticatedRequest } from "../interfaces/oidc.interface";

@Injectable()
export class TeamGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const teamId = request.query.teamId;

    if (!teamId) {
      throw new ForbiddenException("teamId query parameter is required");
    }

    if (user.team_id !== teamId) {
      throw new ForbiddenException("You do not have access to this team");
    }

    return true;
  }
}
