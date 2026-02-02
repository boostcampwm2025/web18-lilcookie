import { catchError, retry, timer, type MonoTypeOperatorFunction, type OperatorFunction } from "rxjs";
import { type HttpException } from "@nestjs/common";
import { AxiosError } from "axios";

export function retryWithBackoff<T>(maxRetries = 3, baseDelayMs = 500): MonoTypeOperatorFunction<T> {
  return retry({
    count: maxRetries,
    delay: (_error, retryCount) => timer(baseDelayMs * Math.pow(2, retryCount - 1)),
  });
}

type HttpExceptionConstructor = new (message: string) => HttpException;

export function throwOnAxiosError<T>(
  ExceptionClass: HttpExceptionConstructor,
  message: string,
): OperatorFunction<T, T> {
  return catchError((error: unknown) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? "unknown";
      const body: unknown = error.response?.data;
      const detail = body != null ? JSON.stringify(body) : error.message;
      throw new ExceptionClass(`${message}: ${status} ${detail}`);
    }
    throw error;
  });
}
