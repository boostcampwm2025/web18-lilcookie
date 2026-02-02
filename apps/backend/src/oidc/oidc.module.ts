import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { OidcService } from "./oidc.service";
import { OidcGuard } from "./guards/oidc.guard";
import { ScopesGuard } from "./guards/scopes.guard";
import { UserModule } from "../user/user.module";
import { OAuthAppsModule } from "../oauth-apps/oauth-apps.module";

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    UserModule,
    forwardRef(() => OAuthAppsModule),
  ],
  providers: [OidcService, OidcGuard, ScopesGuard],
  exports: [OidcService, OidcGuard, ScopesGuard],
})
export class OidcModule {}
