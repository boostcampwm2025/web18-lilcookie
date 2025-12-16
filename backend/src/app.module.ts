import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { LoggerModule } from "./logger/logger.module";
import { HealthModule } from "./health/health.module";
import { LinksModule } from "./links/links.module";
import { AiModule } from "./ai/ai.module";

@Module({
  imports: [AppConfigModule, LoggerModule, HealthModule, LinksModule, AiModule],
})
export class AppModule {}
