"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const freeTrialController_1 = require("../controllers/freeTrialController");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(middleware_1.auth);
// Check if free trial is available
router.get('/check-availability', freeTrialController_1.freeTrialController.checkTrialAvailability);
// Activate free trial
router.post('/activate', freeTrialController_1.freeTrialController.activateFreeTrial);
exports.default = router;
//# sourceMappingURL=freeTrial.js.map