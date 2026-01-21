import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { AuthenticatedRequest } from "../interfaces/oidc.interface";

@Injectable()
export class TeamGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const rawTeamId = request.query.teamId;

    if (Array.isArray(rawTeamId)) {
      throw new ForbiddenException("Multiple teamId query parameters are not allowed");
    }

    if (typeof rawTeamId !== "string" || !rawTeamId) {
      throw new ForbiddenException("teamId query parameter is required");
    }

    const teamId = rawTeamId;
    if (user.team_id !== teamId) {
      throw new ForbiddenException("You do not have access to this team");
    }

    return true;
  }
}
