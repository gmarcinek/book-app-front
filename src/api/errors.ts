// src/api/errors.ts
export class ApiError extends Error {
  public status: number;
  public originalError?: Error;

  constructor(message: string, status: number = 500, originalError?: Error) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.originalError = originalError;
  }

  static fromResponse(response: Response, data?: any): ApiError {
    const message = data?.detail || `HTTP ${response.status}: ${response.statusText}`;
    return new ApiError(message, response.status);
  }

  static fromNetworkError(error: Error): ApiError {
    return new ApiError(
      'Network error - check if API server is running',
      0,
      error
    );
  }
}