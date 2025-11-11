"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MessOffDayAuditSchema = new mongoose_1.Schema({
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MessProfile', index: true, required: true },
    offDayId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MessOffDay', index: true },
    action: { type: String, enum: ['create', 'update', 'delete'], required: true, index: true },
    by: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now, index: true },
    changes: { type: mongoose_1.Schema.Types.Mixed },
    snapshot: { type: mongoose_1.Schema.Types.Mixed },
    note: { type: String, maxlength: 1000 }
});
const MessOffDayAudit = mongoose_1.default.model('MessOffDayAudit', MessOffDayAuditSchema);
exports.default = MessOffDayAudit;
//# sourceMappingURL=MessOffDayAudit.js.map