import { Module } from "@nestjs/common";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";
import { TeamRepository } from "./repositories/team.repository";
import { FolderRepository } from "../folders/repositories/folder.repository";
import { DatabaseModule } from "../database/database.module";
import { OidcModule } from "../oidc/oidc.module";
import { UserModule } from "../user/user.module";
import { TeamMemberGuard } from "./team-member.guard";

@Module({
  imports: [DatabaseModule, OidcModule, UserModule],
  controllers: [TeamsController],
  providers: [TeamsService, TeamRepository, TeamMemberGuard, FolderRepository],
  exports: [TeamsService, TeamMemberGuard, TeamRepository],
})
export class TeamsModule {}
