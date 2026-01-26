import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { OidcService } from "./oidc.service";
import { OidcGuard } from "./guards/oidc.guard";
import { TeamGuard } from "./guards/team.guard";
import { ScopesGuard } from "./guards/scopes.guard";

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [OidcService, OidcGuard, TeamGuard, ScopesGuard],
  exports: [OidcService, OidcGuard, TeamGuard, ScopesGuard],
})
export class OidcModule {}
