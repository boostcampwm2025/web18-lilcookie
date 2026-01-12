export class HealthCheckResponseDto {
  check: string;
  timestamp: string;

  constructor(partial: Partial<HealthCheckResponseDto>) {
    Object.assign(this, partial);
  }

  static create(): HealthCheckResponseDto {
    return new HealthCheckResponseDto({
      check: "ok",
      timestamp: new Date().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      }),
    });
  }
}
