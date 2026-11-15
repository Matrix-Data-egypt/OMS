"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApprovalRules = exports.getApprovalRules = void 0;
const zod_1 = require("zod");
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const client_1 = require("@prisma/client");
const approvalRuleSchema = zod_1.z.object({
    levelOrder: zod_1.z.number().int().positive(),
    minAmount: zod_1.z.number().nonnegative(),
    maxAmount: zod_1.z.number().positive(),
    requiredRole: zod_1.z.nativeEnum(client_1.UserRole),
    description: zod_1.z.string().optional(),
});
const getApprovalRules = async (req, res) => {
    try {
        const rules = await prismaClient_js_1.default.approvalRule.findMany({
            orderBy: { levelOrder: 'asc' },
        });
        res.json({ success: true, data: rules });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب قواعد الاعتماد' });
    }
};
exports.getApprovalRules = getApprovalRules;
const updateApprovalRules = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const rulesArraySchema = zod_1.z.array(approvalRuleSchema).min(1, 'يجب تحديد مستوى واحد على الأقل');
        const parseResult = rulesArraySchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const rules = parseResult.data;
        // Validate that rules do not overlap and are strictly sequential
        // Sort by minAmount
        const sorted = [...rules].sort((a, b) => a.minAmount - b.minAmount);
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].maxAmount >= sorted[i + 1].minAmount) {
                res.status(400).json({
                    success: false,
                    message: `خطأ في النطاق: الحدود المالية بين المستوى ${sorted[i].levelOrder} والمستوى ${sorted[i + 1].levelOrder} متداخلة (${sorted[i].maxAmount} ج.م >= ${sorted[i + 1].minAmount} ج.م)`,
                });
                return;
            }
        }
        // Replace rules in database
        await prismaClient_js_1.default.$transaction(async (tx) => {
            await tx.approvalRule.deleteMany({});
            for (let i = 0; i < sorted.length; i++) {
                await tx.approvalRule.create({
                    data: {
                        levelOrder: i + 1,
                        minAmount: sorted[i].minAmount,
                        maxAmount: sorted[i].maxAmount,
                        requiredRole: sorted[i].requiredRole,
                        description: sorted[i].description,
                        isActive: true,
                    },
                });
            }
            await tx.auditLog.create({
                data: {
                    entity: 'APPROVAL_RULES',
                    entityId: 'ALL',
                    action: 'UPDATE_APPROVAL_RULES',
                    performedById: req.user.id,
                    details: `قام مسؤول النظام ${req.user.name} بتحديث قواعد وحدود مستويات الاعتماد (${sorted.length} مستويات)`,
                },
            });
        });
        const updated = await prismaClient_js_1.default.approvalRule.findMany({ orderBy: { levelOrder: 'asc' } });
        res.json({
            success: true,
            data: updated,
            message: 'تم تحديث حدود وقواعد الاعتماد بنجاح والتأكد من عدم وجود أي تداخلات مالية',
        });
    }
    catch (error) {
        console.error('updateApprovalRules error:', error);
        res.status(500).json({ success: false, message: 'خطأ أثناء تحديث قواعد الاعتماد' });
    }
};
exports.updateApprovalRules = updateApprovalRules;
