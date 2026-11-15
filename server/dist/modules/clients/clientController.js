"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const zod_1 = require("zod");
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const clientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'اسم العميل مطلوب'),
    companyName: zod_1.z.string().optional(),
    email: zod_1.z.string().email('صيغة البريد غير صحيحة').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional(),
    whatsappNumber: zod_1.z.string().optional(),
    taxNumber: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const getClients = async (req, res) => {
    try {
        const clients = await prismaClient_js_1.default.client.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { invoices: true },
                },
            },
        });
        res.json({ success: true, data: clients });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب بيانات العملاء' });
    }
};
exports.getClients = getClients;
const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await prismaClient_js_1.default.client.findUnique({
            where: { id },
            include: {
                invoices: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!client) {
            res.status(404).json({ success: false, message: 'العميل غير موجود' });
            return;
        }
        res.json({ success: true, data: client });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب تفاصيل العميل' });
    }
};
exports.getClientById = getClientById;
const createClient = async (req, res) => {
    try {
        const parseResult = clientSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const client = await prismaClient_js_1.default.client.create({
            data: parseResult.data,
        });
        res.status(201).json({ success: true, data: client, message: 'تم إضافة العميل بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في إضافة العميل' });
    }
};
exports.createClient = createClient;
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const parseResult = clientSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const client = await prismaClient_js_1.default.client.update({
            where: { id },
            data: parseResult.data,
        });
        res.json({ success: true, data: client, message: 'تم تحديث بيانات العميل بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في تحديث بيانات العميل' });
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        await prismaClient_js_1.default.client.update({
            where: { id },
            data: { isActive: false },
        });
        res.json({ success: true, message: 'تم حذف العميل بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في حذف العميل' });
    }
};
exports.deleteClient = deleteClient;
