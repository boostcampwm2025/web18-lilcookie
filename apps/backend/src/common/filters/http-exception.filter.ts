import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
  type LoggerService,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ResponseBuilder } from "../builders/response.builder";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

/**
 * 전역 HTTP 예외 필터
 * 모든 예외를 ResponseBuilder를 통해 통일된 형식으로 변환
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HTTP 상태 코드 결정
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // 에러 메시지 추출
    let message = "알 수 없는 서버 오류";
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        // NestJS ValidationPipe 등의 에러 형식 처리
        const responseObj = exceptionResponse as Record<string, unknown>;
        const messageField = responseObj.message;

        // message가 배열이면 문자열로 합치기
        if (Array.isArray(messageField)) {
          message = messageField.join(", ");
        } else if (typeof messageField === "string") {
          message = messageField;
        } else {
          message = exception.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 에러 로깅
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : "",
    );

    // ResponseBuilder를 사용한 통일된 에러 응답
    const errorResponse = ResponseBuilder.error().status(status).message(message).build();

    response.status(status).json(errorResponse);
  }
}
