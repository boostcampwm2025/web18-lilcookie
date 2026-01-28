import { Global, Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";
import { utilities as nestWinstonUtilities } from "nest-winston";
import * as path from "path";

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>("NODE_ENV", "development");
        const isProduction = nodeEnv === "production";
        const logDir = path.join(process.cwd(), "logs");

        // 공통 로그 포맷
        const logFormat = winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.errors({ stack: true }),
        );

        // 콘솔 출력용 포맷
        const consoleFormat = winston.format.combine(
          winston.format.timestamp(),
          nestWinstonUtilities.format.nestLike("Backend", {
            prettyPrint: true,
            colors: !isProduction,
          }),
        );

        // 파일 저장용 포맷 (JSON)
        const fileFormat = winston.format.combine(logFormat, winston.format.json());

        return {
          transports: [
            // 콘솔 출력
            new winston.transports.Console({
              level: isProduction ? "info" : "debug",
              format: consoleFormat,
            }),

            // 프로덕션 환경에서만 파일 로그 활성화
            ...(isProduction
              ? [
                  // 전체 로그 파일
                  new winston.transports.File({
                    level: "info",
                    dirname: logDir,
                    filename: "app.log",
                    format: fileFormat,
                    maxsize: 10 * 1024 * 1024, // 10MB
                    maxFiles: 5,
                  }),
                  // 에러 로그 파일 (별도 관리)
                  new winston.transports.File({
                    level: "error",
                    dirname: logDir,
                    filename: "error.log",
                    format: fileFormat,
                    maxsize: 10 * 1024 * 1024, // 10MB
                    maxFiles: 5,
                  }),
                ]
              : []),
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
