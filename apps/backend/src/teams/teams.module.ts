import { Module } from "@nestjs/common";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";
import { TeamRepository } from "./repositories/team.repository";
import { FolderRepository } from "../folders/repositories/folder.repository";
import { DatabaseModule } from "../database/database.module";
import { OidcModule } from "../oidc/oidc.module";
import { UserModule } from "../user/user.module";
import { TeamMemberGuard } from "./team-member.guard";
import { TokenUsageRepository } from "./repositories/token-usage.repository";
import { TokenUsageService } from "./token-usage.service";
import { UserRepository } from "src/user/user.repository";

@Module({
  imports: [DatabaseModule, OidcModule, UserModule],
  controllers: [TeamsController],
  providers: [
    TeamsService,
    TeamRepository,
    TeamMemberGuard,
    FolderRepository,
    UserRepository,
    TokenUsageRepository,
    TokenUsageService,
  ],
  exports: [TeamsService, TeamMemberGuard, TeamRepository, TokenUsageService],
})
export class TeamsModule {}
