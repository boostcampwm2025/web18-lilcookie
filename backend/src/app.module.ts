import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { LoggerModule } from "./logger/logger.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [AppConfigModule, LoggerModule, HealthModule],
})
export class AppModule {}
