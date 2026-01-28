import { Module } from "@nestjs/common";
import { FoldersController } from "./folders.controller";
import { FoldersService } from "./folders.service";
import { DatabaseModule } from "../database/database.module";
import { FolderRepository } from "./repositories/folder.repository";
import { OidcModule } from "../oidc/oidc.module";
import { UserModule } from "src/user/user.module";
import { TeamRepository } from "src/teams/repositories/team.repository";

@Module({
  imports: [DatabaseModule, OidcModule, UserModule],
  controllers: [FoldersController],
  providers: [FoldersService, FolderRepository, TeamRepository],
  exports: [FoldersService],
})
export class FoldersModule {}
