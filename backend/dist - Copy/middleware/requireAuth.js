"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requireAuth;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function requireAuth(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env['JWT_SECRET']);
        console.log('Decoded token:', decoded);
        // Get user from database
        const userId = decoded.id || decoded.userId;
        console.log('Looking for user with ID:', userId);
        const user = await User_1.default.findById(userId).select('-password');
        console.log('Found user:', user ? user.email : 'null');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        // Add user to request object
        req.user = user;
        return next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
}
//# sourceMappingURL=requireAuth.js.map