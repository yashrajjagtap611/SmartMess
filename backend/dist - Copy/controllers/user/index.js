"use strict";
// User Controllers Barrel File
// This file exports all user-related controllers
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = exports.UserController = void 0;
var userController_1 = require("../userController");
Object.defineProperty(exports, "UserController", { enumerable: true, get: function () { return __importDefault(userController_1).default; } });
// Export specific user controller methods
exports.userControllers = {
    profile: {
        get: 'getProfile',
        update: 'updateProfile',
        delete: 'deleteProfile'
    },
    settings: {
        get: 'getSettings',
        update: 'updateSettings'
    },
    preferences: {
        get: 'getPreferences',
        update: 'updatePreferences'
    },
    activity: {
        get: 'getActivity',
        memberships: 'getMemberships',
        notifications: 'getNotifications'
    }
};
//# sourceMappingURL=index.js.map