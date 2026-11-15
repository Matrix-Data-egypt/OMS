"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
    password: zod_1.z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
});
const login = async (req, res) => {
    try {
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const { email, password } = parseResult.data;
        const user = await prismaClient_js_1.default.user.findUnique({
            where: { email },
        });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة أو الحساب غير مفعّل' });
            return;
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordMatch) {
            res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
            return;
        }
        const secret = process.env.JWT_SECRET || 'oms_jwt_secret_super_secure_key_2026_mde';
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }, secret, { expiresIn: expiresIn });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                },
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const user = await prismaClient_js_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        });
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب بيانات المستخدم' });
    }
};
exports.getProfile = getProfile;
