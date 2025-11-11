"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_MESSAGES = exports.STATUS_CODES = void 0;
exports.STATUS_CODES = {
    // Success Codes
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    // Client Error Codes
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    // Server Error Codes
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};
exports.STATUS_MESSAGES = {
    [exports.STATUS_CODES.OK]: 'OK',
    [exports.STATUS_CODES.CREATED]: 'Created',
    [exports.STATUS_CODES.ACCEPTED]: 'Accepted',
    [exports.STATUS_CODES.NO_CONTENT]: 'No Content',
    [exports.STATUS_CODES.BAD_REQUEST]: 'Bad Request',
    [exports.STATUS_CODES.UNAUTHORIZED]: 'Unauthorized',
    [exports.STATUS_CODES.FORBIDDEN]: 'Forbidden',
    [exports.STATUS_CODES.NOT_FOUND]: 'Not Found',
    [exports.STATUS_CODES.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
    [exports.STATUS_CODES.CONFLICT]: 'Conflict',
    [exports.STATUS_CODES.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [exports.STATUS_CODES.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [exports.STATUS_CODES.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [exports.STATUS_CODES.NOT_IMPLEMENTED]: 'Not Implemented',
    [exports.STATUS_CODES.BAD_GATEWAY]: 'Bad Gateway',
    [exports.STATUS_CODES.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [exports.STATUS_CODES.GATEWAY_TIMEOUT]: 'Gateway Timeout',
};
//# sourceMappingURL=statusCodes.js.map