import { Module } from "@nestjs/common";
import { LinksController } from "./links.controller";
import { LinksService } from "./links.service";
import { NotificationModule } from "../notification/notification.module";
import { LinkRepository } from "./repositories/link.repository";
import { OidcModule } from "../oidc/oidc.module";

@Module({
  imports: [NotificationModule, OidcModule],
  controllers: [LinksController],
  providers: [LinksService, LinkRepository],
})
export class LinksModule {}
