import { ApiResponse, ErrorResponse, SuccessResponse } from "./response.type";

export class ResponseBuilder<T = unknown> {
  private response: ApiResponse<T>;

  private constructor(success: boolean) {
    this.response = success ? ({ success: true } as SuccessResponse<T>) : ({ success: false } as ErrorResponse);
  }

  static success<T = unknown>(): ResponseBuilder<T> {
    return new ResponseBuilder<T>(true);
  }

  static error(): ResponseBuilder<never> {
    return new ResponseBuilder<never>(false);
  }

  status(status: number): this {
    this.response.status = status;
    return this;
  }

  message(message: string): this {
    this.response.message = message;
    return this;
  }

  data(data: T): this {
    if (this.response.success) {
      this.response.data = data;
    }
    return this;
  }

  build(): ApiResponse<T> {
    return this.response;
  }
}
