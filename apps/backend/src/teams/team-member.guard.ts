import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { TeamRepository } from "./repositories/team.repository";
import { AuthenticatedRequest } from "../oidc/types/oidc.types";

@Injectable()
export class TeamMemberGuard implements CanActivate {
  constructor(private readonly teamRepository: TeamRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // 라우트 파라미터 :uuid 우선, 없으면 쿼리 파라미터 ?teamId fallback
    const teamUuid = (request.params?.uuid as string) || (request.query?.teamId as string);

    if (!teamUuid) {
      throw new ForbiddenException("팀 식별자가 필요합니다");
    }

    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("팀을 찾을 수 없습니다");
    }

    const member = await this.teamRepository.findMember(team.teamId, user.userId);
    if (!member) {
      throw new ForbiddenException("해당 팀의 멤버만 접근할 수 있습니다");
    }

    // 후속 컨트롤러에서 재조회 방지
    (request as any).team = team;
    (request as any).teamMember = member;

    return true;
  }
}
