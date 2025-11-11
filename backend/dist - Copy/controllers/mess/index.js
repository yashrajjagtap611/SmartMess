"use strict";
// Mess Controllers Barrel File
// This file exports all mess-related controllers
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messControllers = exports.MessController = void 0;
var messController_1 = require("../messController");
Object.defineProperty(exports, "MessController", { enumerable: true, get: function () { return __importDefault(messController_1).default; } });
// Export specific mess controller methods
exports.messControllers = {
    profile: {
        get: 'getProfile',
        update: 'updateProfile',
        create: 'createProfile'
    },
    membership: {
        get: 'getMemberships',
        create: 'createMembership',
        update: 'updateMembership',
        delete: 'deleteMembership'
    },
    user: {
        get: 'getUsers',
        add: 'addUser',
        remove: 'removeUser',
        update: 'updateUser'
    },
    search: {
        search: 'searchMesses',
        filter: 'filterMesses'
    }
};
//# sourceMappingURL=index.js.map