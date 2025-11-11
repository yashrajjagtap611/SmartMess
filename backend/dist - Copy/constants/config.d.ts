export declare const CONFIG: {
    JWT: {
        EXPIRES_IN: string;
        REFRESH_EXPIRES_IN: string;
    };
    OTP: {
        EXPIRY_MINUTES: number;
        LENGTH: number;
    };
    UPLOAD: {
        MAX_FILE_SIZE: number;
        ALLOWED_IMAGE_TYPES: string[];
        ALLOWED_DOCUMENT_TYPES: string[];
    };
    PAGINATION: {
        DEFAULT_PAGE: number;
        DEFAULT_LIMIT: number;
        MAX_LIMIT: number;
    };
    RATE_LIMIT: {
        WINDOW_MS: number;
        MAX_REQUESTS: number;
    };
    EMAIL: {
        FROM_NAME: string;
        FROM_EMAIL: string;
    };
    DATABASE: {
        CONNECTION_TIMEOUT: number;
        MAX_POOL_SIZE: number;
    };
    SERVER: {
        PORT: string | number;
        HOST: string;
        NODE_ENV: string;
    };
};
//# sourceMappingURL=config.d.ts.map