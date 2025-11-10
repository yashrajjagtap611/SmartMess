// Centralized Error Handling for Frontend
import { API_ERROR_MESSAGES, API_STATUS_CODES } from '@/constants/api';

export interface AppError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

export class ErrorHandler {
  static createError(
    message: string,
    code?: string,
    statusCode?: number,
    details?: any
  ): AppError {
    return {
      message,
      code: code || 'UNKNOWN_ERROR',
      statusCode: statusCode || 500,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static handleApiError(error: any): AppError {
    // Network error
    if (!error.response) {
      return this.createError(
        API_ERROR_MESSAGES.NETWORK_ERROR,
        'NETWORK_ERROR',
        0
      );
    }

    const { status, data } = error.response;
    const message = data?.message || this.getDefaultMessage(status);
    const code = data?.code || this.getDefaultCode(status);

    return this.createError(message, code, status, data?.details);
  }

  static handleAuthError(error: any): AppError {
    const { status } = error.response || {};
    
    if (status === API_STATUS_CODES.UNAUTHORIZED) {
      // Clear auth data and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('authExpires');
      
      return this.createError(
        API_ERROR_MESSAGES.UNAUTHORIZED,
        'AUTH_ERROR',
        status
      );
    }

    return this.handleApiError(error);
  }

  static getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case API_STATUS_CODES.BAD_REQUEST:
        return API_ERROR_MESSAGES.VALIDATION_ERROR;
      case API_STATUS_CODES.UNAUTHORIZED:
        return API_ERROR_MESSAGES.UNAUTHORIZED;
      case API_STATUS_CODES.FORBIDDEN:
        return API_ERROR_MESSAGES.FORBIDDEN;
      case API_STATUS_CODES.NOT_FOUND:
        return API_ERROR_MESSAGES.NOT_FOUND;
      case API_STATUS_CODES.INTERNAL_SERVER_ERROR:
        return API_ERROR_MESSAGES.SERVER_ERROR;
      default:
        return API_ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  static getDefaultCode(statusCode: number): string {
    switch (statusCode) {
      case API_STATUS_CODES.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case API_STATUS_CODES.UNAUTHORIZED:
        return 'AUTH_ERROR';
      case API_STATUS_CODES.FORBIDDEN:
        return 'FORBIDDEN';
      case API_STATUS_CODES.NOT_FOUND:
        return 'NOT_FOUND';
      case API_STATUS_CODES.INTERNAL_SERVER_ERROR:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  static logError(error: AppError, context?: string): void {
    console.error(`Error${context ? ` in ${context}` : ''}:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: error.timestamp,
    });
  }
}

// Error boundary helper
export const getErrorBoundaryFallback = (error: Error) => ({
  hasError: true,
  error: ErrorHandler.createError(
    error.message || 'Something went wrong',
    'BOUNDARY_ERROR',
    500
  ),
});

export default ErrorHandler;
