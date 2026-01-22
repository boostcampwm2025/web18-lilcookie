import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OidcService } from "./oidc.service";
import { OidcGuard } from "./guards/oidc.guard";
import { TeamGuard } from "./guards/team.guard";
import { ScopesGuard } from "./guards/scopes.guard";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [ConfigModule, UserModule],
  providers: [OidcService, OidcGuard, TeamGuard, ScopesGuard],
  exports: [OidcService, OidcGuard, TeamGuard, ScopesGuard, UserModule],
})
export class OidcModule {}
