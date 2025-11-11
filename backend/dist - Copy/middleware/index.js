"use strict";
// Middleware Barrel File
// This file exports all middleware in an organized manner
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMiddleware = exports.handleError = exports.auth = exports.checkCanAddMeals = exports.checkCanAcceptUsers = exports.checkSubscription = exports.uploadLimiter = exports.otpLimiter = exports.authLimiter = exports.apiLimiter = exports.schemas = exports.validate = exports.CustomError = exports.asyncHandler = exports.notFound = exports.errorHandler = exports.requireAuth = void 0;
// Core Middleware
var requireAuth_1 = require("./requireAuth");
Object.defineProperty(exports, "requireAuth", { enumerable: true, get: function () { return __importDefault(requireAuth_1).default; } });
var errorHandler_1 = require("./errorHandler");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return errorHandler_1.errorHandler; } });
Object.defineProperty(exports, "notFound", { enumerable: true, get: function () { return errorHandler_1.notFound; } });
Object.defineProperty(exports, "asyncHandler", { enumerable: true, get: function () { return errorHandler_1.asyncHandler; } });
Object.defineProperty(exports, "CustomError", { enumerable: true, get: function () { return errorHandler_1.CustomError; } });
var validation_1 = require("./validation");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validation_1.validate; } });
Object.defineProperty(exports, "schemas", { enumerable: true, get: function () { return validation_1.schemas; } });
var rateLimiter_1 = require("./rateLimiter");
Object.defineProperty(exports, "apiLimiter", { enumerable: true, get: function () { return rateLimiter_1.apiLimiter; } });
Object.defineProperty(exports, "authLimiter", { enumerable: true, get: function () { return rateLimiter_1.authLimiter; } });
Object.defineProperty(exports, "otpLimiter", { enumerable: true, get: function () { return rateLimiter_1.otpLimiter; } });
Object.defineProperty(exports, "uploadLimiter", { enumerable: true, get: function () { return rateLimiter_1.uploadLimiter; } });
// Security Middleware
__exportStar(require("./security"), exports);
// Admin Middleware
__exportStar(require("./admin"), exports);
// Subscription Middleware
var checkSubscription_1 = require("./checkSubscription");
Object.defineProperty(exports, "checkSubscription", { enumerable: true, get: function () { return checkSubscription_1.checkSubscription; } });
Object.defineProperty(exports, "checkCanAcceptUsers", { enumerable: true, get: function () { return checkSubscription_1.checkCanAcceptUsers; } });
Object.defineProperty(exports, "checkCanAddMeals", { enumerable: true, get: function () { return checkSubscription_1.checkCanAddMeals; } });
// Re-export commonly used middleware
var requireAuth_2 = require("./requireAuth");
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return __importDefault(requireAuth_2).default; } });
var errorHandler_2 = require("./errorHandler");
Object.defineProperty(exports, "handleError", { enumerable: true, get: function () { return errorHandler_2.errorHandler; } });
var validation_2 = require("./validation");
Object.defineProperty(exports, "validateMiddleware", { enumerable: true, get: function () { return validation_2.validate; } });
//# sourceMappingURL=index.js.map