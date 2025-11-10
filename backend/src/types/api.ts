export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  timestamp?: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface IErrorResponse {
  success: false;
  message: string;
  code: string;
  timestamp: string;
  details?: any;
}

export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface IValidationErrorResponse extends IErrorResponse {
  code: 'VALIDATION_ERROR';
  details: IValidationError[];
}

export interface IAuthErrorResponse extends IErrorResponse {
  code: 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED';
}

export interface INotFoundErrorResponse extends IErrorResponse {
  code: 'NOT_FOUND';
  resource: string;
  id?: string;
}

export interface IConflictErrorResponse extends IErrorResponse {
  code: 'CONFLICT';
  resource: string;
  field: string;
  value: any;
}

export interface IRateLimitErrorResponse extends IErrorResponse {
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter?: number;
}

export interface IFileUploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
}

export interface IHealthCheckResponse {
  success: boolean;
  message: string;
  data: {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    services: {
      database: 'connected' | 'disconnected';
      email: 'connected' | 'disconnected';
      cloudinary: 'connected' | 'disconnected';
    };
  };
}

export interface IStatsResponse {
  success: boolean;
  message: string;
  data: {
    users: {
      total: number;
      active: number;
      verified: number;
    };
    messes: {
      total: number;
      active: number;
      approved: number;
    };
    memberships: {
      total: number;
      active: number;
      expired: number;
    };
    revenue: {
      total: number;
      thisMonth: number;
      lastMonth: number;
    };
  };
} 