"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getServices = void 0;
const zod_1 = require("zod");
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const serviceSchema = zod_1.z.object({
    nameAr: zod_1.z.string().min(2, 'الاسم بالعربية مطلوب'),
    nameEn: zod_1.z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
    description: zod_1.z.string().optional(),
    defaultPrice: zod_1.z.number().nonnegative('السعر الافتراضي يجب أن يكون أكبر من أو يساوي صفر'),
    defaultTaxRate: zod_1.z.number().nonnegative('نسبة الضريبة يجب أن تكون أكبر من أو تساوي صفر').default(14.00),
});
const getServices = async (req, res) => {
    try {
        const services = await prismaClient_js_1.default.service.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: services });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الخدمات' });
    }
};
exports.getServices = getServices;
const createService = async (req, res) => {
    try {
        const parseResult = serviceSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const service = await prismaClient_js_1.default.service.create({
            data: parseResult.data,
        });
        res.status(201).json({ success: true, data: service, message: 'تم إضافة الخدمة بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في إضافة الخدمة' });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const parseResult = serviceSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const service = await prismaClient_js_1.default.service.update({
            where: { id },
            data: parseResult.data,
        });
        res.json({ success: true, data: service, message: 'تم تحديث بيانات الخدمة بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في تحديث الخدمة' });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_js_1.default.service.update({
            where: { id },
            data: { isActive: false },
        });
        res.json({ success: true, message: 'تم تعطيل الخدمة بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في حذف الخدمة' });
    }
};
exports.deleteService = deleteService;
