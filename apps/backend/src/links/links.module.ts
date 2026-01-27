import { Module } from "@nestjs/common";
import { LinksController } from "./links.controller";
import { LinksService } from "./links.service";
import { NotificationModule } from "../notification/notification.module";
import { LinkRepository } from "./repositories/link.repository";
import { OidcModule } from "../oidc/oidc.module";
import { UserModule } from "../user/user.module";
import { TeamRepository } from "../teams/repositories/team.repository";
import { FolderRepository } from "../folders/repositories/folder.repository";

@Module({
  imports: [NotificationModule, OidcModule, UserModule],
  controllers: [LinksController],
  providers: [LinksService, LinkRepository, TeamRepository, FolderRepository],
  exports: [LinksService],
})
export class LinksModule {}
