import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  type LoggerService,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { ResponseBuilder } from "../common/builders/response.builder";
import { TestValidationRequestDto } from "./dto/test-validation.request.dto";
import { HealthCheckResponseDto } from "./dto/health-check.response.dto";
import { TestValidationResponseDto } from "./dto/test-validation.response.dto";

/**
 * 아래 엔드포인트들은 파이프, 필터, 예외, 응답 빌더 테스트용이에요.
 * 아래의 API 구조와 응답 형식을 참고하여 개발에 활용하세요.
 */
@Controller("health")
export class HealthController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // 응답 빌더 + 헬스체크 테스트용
  @Get()
  check() {
    this.logger.log("헬스체크 엔드포인트 호출됨");

    const responseDto = HealthCheckResponseDto.create();

    return ResponseBuilder.success<HealthCheckResponseDto>()
      .status(HttpStatus.OK)
      .message("헬스체크 성공")
      .data(responseDto)
      .build();
  }

  // 예외 발생 시 필터로 처리되는지 테스트용
  @Get("error")
  testError() {
    this.logger.log("헬스체크 에러 엔드포인트 호출됨");
    throw new BadRequestException("헬스체크 테스트 오류입니다");
  }

  // Body 유효성 검사 + Transform 테스트용
  @Post("validate-body")
  testValidationPipe(@Body() requestDto: TestValidationRequestDto) {
    this.logger.log("Body 유효성 검사 엔드포인트 호출됨", requestDto);

    const responseDto = TestValidationResponseDto.from(requestDto);

    return ResponseBuilder.success<TestValidationResponseDto>()
      .status(HttpStatus.OK)
      .message("유효성 검사 및 타입 변환 성공")
      .data(responseDto)
      .build();
  }

  // Query 유효성 검사 + Transform 테스트용
  @Get("validate-query")
  testQueryTransform(@Query() requestDto: TestValidationRequestDto) {
    this.logger.log("Query 유효성 검사 엔드포인트 호출됨", requestDto);

    return ResponseBuilder.success<TestValidationResponseDto>()
      .status(HttpStatus.OK)
      .message("Query 파라미터 검증 및 변환 성공")
      .data({
        received: requestDto,
      })
      .build();
  }
}
