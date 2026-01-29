import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { ConfigService } from "@nestjs/config";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ValidationPipe, type LoggerService } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { SwaggerModule } from "@nestjs/swagger";
import { createSwaggerConfig } from "./config/swagger.config";
import { cleanupOpenApiDoc } from "nestjs-zod";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Winston 로거를 NestJS 전역 로거로 설정
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // 쿠키 파서 미들웨어 설정
  app.use(cookieParser());

  // 전역 Exception Filter 등록 (ResponseBuilder 사용)
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // CORS 설정 (전역)
  app.enableCors({
    origin: true, // 개발 환경: 모든 origin 허용 (프로덕션에서는 특정 도메인만 허용)
    credentials: true, // 쿠키 전송 허용
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // 전역 Validation Pipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성 있으면 에러
      transform: true, // 자동 타입 변환
    }),
  );

  // api 접두어 추가 설정
  app.setGlobalPrefix("api");

  // Swagger 문서 설정
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, cleanupOpenApiDoc(document));

  // ConfigService를 통한 환경변수 접근
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);

  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
