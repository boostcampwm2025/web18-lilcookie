import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { LoggerModule } from "./logger/logger.module";
import { HealthModule } from "./health/health.module";
import { LinksModule } from "./links/links.module";
import { AiModule } from "./ai/ai.module";
import { DatabaseModule } from "./database/database.module";
import { NotificationModule } from "./notification/notification.module";

@Module({
  imports: [DatabaseModule, AppConfigModule, LoggerModule, HealthModule, LinksModule, AiModule, NotificationModule],
})
export class AppModule {}
