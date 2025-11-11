"use strict";
// Controllers Barrel File
// This file exports all controllers in an organized manner
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
exports.AdminController = exports.MessController = exports.UserController = exports.AuthController = void 0;
// Core Controllers
var authController_1 = require("./authController");
Object.defineProperty(exports, "AuthController", { enumerable: true, get: function () { return __importDefault(authController_1).default; } });
var userController_1 = require("./userController");
Object.defineProperty(exports, "UserController", { enumerable: true, get: function () { return __importDefault(userController_1).default; } });
var messController_1 = require("./messController");
Object.defineProperty(exports, "MessController", { enumerable: true, get: function () { return __importDefault(messController_1).default; } });
var admin_1 = require("./admin");
Object.defineProperty(exports, "AdminController", { enumerable: true, get: function () { return __importDefault(admin_1).default; } });
// Feature-specific controllers
__exportStar(require("./user"), exports);
__exportStar(require("./mess"), exports);
//# sourceMappingURL=index.js.map