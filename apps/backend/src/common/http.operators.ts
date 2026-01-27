import { retry, timer, type MonoTypeOperatorFunction } from "rxjs";

export function retryWithBackoff<T>(maxRetries = 3, baseDelayMs = 500): MonoTypeOperatorFunction<T> {
  return retry({
    count: maxRetries,
    delay: (_error, retryCount) => timer(baseDelayMs * Math.pow(2, retryCount - 1)),
  });
}
