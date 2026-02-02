import { Module, forwardRef } from "@nestjs/common";
import { OAuthAppsController } from "./oauth-apps.controller";
import { OAuthAppsService } from "./oauth-apps.service";
import { OAuthAppRepository } from "./repositories/oauth-app.repository";
import { DatabaseModule } from "../database/database.module";
import { OidcModule } from "../oidc/oidc.module";
import { UserModule } from "../user/user.module";
import { AuthentikAdminModule } from "../authentik-admin/authentik-admin.module";

@Module({
  imports: [DatabaseModule, forwardRef(() => OidcModule), UserModule, AuthentikAdminModule],
  controllers: [OAuthAppsController],
  providers: [OAuthAppsService, OAuthAppRepository],
  exports: [OAuthAppRepository],
})
export class OAuthAppsModule {}
