import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { AuthenticatedRequest } from "../interfaces/oidc.interface";

/**
 * 팀 접근 권한 검사 가드
 * 이제는 Authentik의 team_id 클레임을 사용하지 않을 예정이므로, 삭제 예정
 */
@Injectable()
export class TeamGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const rawTeamId = request.query.teamId;

    if (Array.isArray(rawTeamId)) {
      throw new ForbiddenException("여러 개의 teamId 쿼리 매개변수는 허용되지 않습니다");
    }

    if (typeof rawTeamId !== "string" || !rawTeamId) {
      throw new ForbiddenException("teamId 쿼리 매개변수가 필요합니다");
    }

    const teamId = rawTeamId;
    if (user.team_id !== teamId) {
      throw new ForbiddenException("해당 팀에 대한 접근 권한이 없습니다");
    }

    return true;
  }
}
