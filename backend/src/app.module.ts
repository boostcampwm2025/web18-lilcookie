import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { LoggerModule } from "./logger/logger.module";
import { HealthModule } from "./health/health.module";
import { LinksModule } from "./links/links.module";
import { AiModule } from "./ai/ai.module";
import { DatabaseModule } from "./database/database.module";
import { FoldersModule } from "./folders/folders.module";
import { OidcModule } from "./oidc/oidc.module";

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    LoggerModule,
    HealthModule,
    LinksModule,
    AiModule,
    FoldersModule,
    OidcModule,
  ],
})
export class AppModule {}
