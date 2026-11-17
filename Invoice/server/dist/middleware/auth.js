"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_js_1 = __importDefault(require("../prisma/prismaClient.js"));
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, message: 'مطلوب تسجيل الدخول (Authentication required)' });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || 'oms_jwt_secret_super_secure_key_2026_mde';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Check if user still active in DB
        const user = await prismaClient_js_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, username: true, name: true, role: true, systemAccess: true, isActive: true },
        });
        if (!user || !user.isActive) {
            res.status(403).json({ success: false, message: 'الحساب غير مفعّل أو غير موجود' });
            return;
        }
        if (user.systemAccess === 'MEDIA') {
            res.status(403).json({ success: false, message: 'عفواً، هذا الحساب مصرح له بالدخول لقسم الميديا فقط.' });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            systemAccess: user.systemAccess,
        };
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, message: 'جلسة الدخول غير صالحة أو منتهية' });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const requireRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'ليس لديك الصلاحية الكافية للقيام بهذا الإجراء (Forbidden)',
            });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
