import { Module } from "@nestjs/common";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";
import { TeamRepository } from "./repositories/team.repository";
import { DatabaseModule } from "../database/database.module";
import { OidcModule } from "../oidc/oidc.module";

@Module({
  imports: [DatabaseModule, OidcModule],
  controllers: [TeamsController],
  providers: [TeamsService, TeamRepository],
  exports: [TeamsService],
})
export class TeamsModule {}
