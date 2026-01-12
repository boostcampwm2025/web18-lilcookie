export type SuccessResponse<T> = {
  success: true;
  status?: number;
  message?: string;
  data?: T;
};

export type ErrorResponse = {
  success: false;
  status?: number;
  message?: string;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
