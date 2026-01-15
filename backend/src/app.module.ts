import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { LoggerModule } from "./logger/logger.module";
import { HealthModule } from "./health/health.module";
import { LinksModule } from "./links/links.module";
import { AiModule } from "./ai/ai.module";
import { DatabaseModule } from "./database/database.module";
import { FoldersModule } from "./folders/folders.module";
import { AuthModule } from "./auth/auth.module";
import { OAuthModule } from "./oauth/oauth.module";

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    LoggerModule,
    HealthModule,
    LinksModule,
    AiModule,
    FoldersModule,
    AuthModule,
    OAuthModule,
  ],
})
export class AppModule {}
