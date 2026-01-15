import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "../database/database.module";
import { OAuthService } from "./oauth.service";

/**
 * OAuth Module
 *
 * OAuth 2.0 / OpenID Connect 서버 기능을 제공합니다.
 * oidc-provider는 main.ts에서 Express에 직접 마운트됩니다.
 */
@Module({
  imports: [
    ConfigModule, // 환경 변수 (OAUTH_ISSUER 등)
    DatabaseModule, // PrismaService (Adapter에서 사용)
  ],
  providers: [OAuthService],
  exports: [OAuthService],
})
export class OAuthModule {}
