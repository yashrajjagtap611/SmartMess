"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscriptionCheckController_1 = require("../controllers/subscriptionCheckController");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(middleware_1.auth);
// Get current subscription status
router.get('/status', subscriptionCheckController_1.subscriptionCheckController.getSubscriptionStatus);
// Check if can access a specific module
router.get('/check-module/:module', subscriptionCheckController_1.subscriptionCheckController.checkModuleAccess);
exports.default = router;
//# sourceMappingURL=subscriptionCheck.js.map