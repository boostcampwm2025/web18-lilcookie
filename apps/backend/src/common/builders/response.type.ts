/**
 * 성공 응답 타입
 */
export interface SuccessResponse<T> {
  success: true;
  status: number;
  message: string;
  data: T;
}

/**
 * 에러 응답 타입
 */
export interface ErrorResponse {
  success: false;
  status: number;
  message: string;
}

/**
 * API 응답 통합 타입
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
