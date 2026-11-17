"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelInvoice = exports.updateInvoice = exports.createInvoice = exports.getInvoiceById = exports.getInvoices = exports.formatInvoiceWithOverdue = exports.computeInvoiceTotals = void 0;
const zod_1 = require("zod");
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const client_1 = require("@prisma/client");
const invoiceItemInputSchema = zod_1.z.object({
    serviceId: zod_1.z.string().optional(),
    description: zod_1.z.string().min(1, 'وصف البند مطلوب'),
    quantity: zod_1.z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
    unitPrice: zod_1.z.number().nonnegative('سعر الوحدة غير صالح'),
    discount: zod_1.z.number().nonnegative().default(0),
});
const createInvoiceSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('معرف العميل غير صالح'),
    dueDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), 'تاريخ استحقاق غير صالح'),
    items: zod_1.z.array(invoiceItemInputSchema).min(1, 'يجب إضافة بند واحد على الأقل'),
    discountAmount: zod_1.z.number().nonnegative().default(0),
    taxRate: zod_1.z.number().nonnegative().default(14.00), // VAT default 14%
    applyWht: zod_1.z.boolean().default(false), // ضريبة خصم أرباح تجارية 1%
    notes: zod_1.z.string().optional(),
    terms: zod_1.z.string().optional(),
});
// Helper to compute subtotal, tax, and total
const computeInvoiceTotals = (items, globalDiscount, vatRate, applyWht) => {
    let subtotal = 0;
    for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice - (item.discount || 0);
        subtotal += Math.max(0, itemTotal);
    }
    const taxableAmount = Math.max(0, subtotal - globalDiscount);
    const vatAmount = (taxableAmount * vatRate) / 100;
    const whtAmount = applyWht ? (taxableAmount * 1) / 100 : 0; // 1% withholding
    // Total to be collected = taxableAmount + VAT - WHT (or standard total = taxableAmount + VAT)
    const totalAmount = taxableAmount + vatAmount - whtAmount;
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        taxableAmount: Math.round(taxableAmount * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        whtAmount: Math.round(whtAmount * 100) / 100,
        totalTax: Math.round(vatAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
    };
};
exports.computeInvoiceTotals = computeInvoiceTotals;
// Generate Invoice Number: OMS-YYYY-XXXX
const generateInvoiceNumber = async () => {
    const currentYear = new Date().getFullYear();
    const count = await prismaClient_js_1.default.invoice.count({
        where: {
            invoiceNumber: {
                startsWith: `OMS-${currentYear}-`,
            },
        },
    });
    const sequential = String(count + 1).padStart(4, '0');
    return `OMS-${currentYear}-${sequential}`;
};
// Compute dynamic overdue status
const formatInvoiceWithOverdue = (invoice) => {
    const now = new Date();
    const isOverdue = (invoice.status === client_1.InvoiceStatus.ISSUED || invoice.status === client_1.InvoiceStatus.PARTIALLY_PAID) &&
        Number(invoice.remainingBalance) > 0 &&
        new Date(invoice.dueDate) < now;
    const daysOverdue = isOverdue
        ? Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    return {
        ...invoice,
        isOverdue,
        daysOverdue,
    };
};
exports.formatInvoiceWithOverdue = formatInvoiceWithOverdue;
const getInvoices = async (req, res) => {
    try {
        const { status, clientId, search } = req.query;
        const whereClause = {};
        if (status && typeof status === 'string' && status !== 'ALL') {
            whereClause.status = status;
        }
        if (clientId && typeof clientId === 'string') {
            whereClause.clientId = clientId;
        }
        if (search && typeof search === 'string') {
            whereClause.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { client: { name: { contains: search, mode: 'insensitive' } } },
                { client: { companyName: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const invoices = await prismaClient_js_1.default.invoice.findMany({
            where: whereClause,
            include: {
                client: {
                    select: { id: true, name: true, companyName: true, email: true, phone: true },
                },
                createdBy: {
                    select: { id: true, name: true, role: true },
                },
                approvalSteps: {
                    include: {
                        approver: { select: { id: true, name: true, role: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const enriched = invoices.map(exports.formatInvoiceWithOverdue);
        res.json({ success: true, data: enriched });
    }
    catch (error) {
        console.error('getInvoices error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الفواتير' });
    }
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await prismaClient_js_1.default.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                createdBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
                items: {
                    include: {
                        service: true,
                    },
                },
                taxes: true,
                approvalSteps: {
                    include: {
                        approver: { select: { id: true, name: true, role: true } },
                    },
                    orderBy: { levelOrder: 'asc' },
                },
                payments: {
                    include: {
                        recordedBy: { select: { id: true, name: true } },
                    },
                    orderBy: { paymentDate: 'desc' },
                },
                deliveryLogs: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!invoice) {
            res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
            return;
        }
        res.json({ success: true, data: (0, exports.formatInvoiceWithOverdue)(invoice) });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الفاتورة' });
    }
};
exports.getInvoiceById = getInvoiceById;
const createInvoice = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const parseResult = createInvoiceSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const data = parseResult.data;
        const totals = (0, exports.computeInvoiceTotals)(data.items, data.discountAmount, data.taxRate, data.applyWht);
        const invoiceNumber = await generateInvoiceNumber();
        const invoice = await prismaClient_js_1.default.$transaction(async (tx) => {
            const created = await tx.invoice.create({
                data: {
                    invoiceNumber,
                    clientId: data.clientId,
                    createdById: req.user.id,
                    status: client_1.InvoiceStatus.DRAFT,
                    dueDate: new Date(data.dueDate),
                    subtotal: totals.subtotal,
                    discountAmount: data.discountAmount,
                    taxAmount: totals.totalTax,
                    totalAmount: totals.totalAmount,
                    paidAmount: 0,
                    remainingBalance: totals.totalAmount,
                    notes: data.notes,
                    terms: data.terms,
                    items: {
                        create: data.items.map((item) => ({
                            serviceId: item.serviceId || null,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            discount: item.discount,
                            total: Math.round((item.quantity * item.unitPrice - item.discount) * 100) / 100,
                        })),
                    },
                },
            });
            // Audit Log
            await tx.auditLog.create({
                data: {
                    entity: 'INVOICE',
                    entityId: created.id,
                    action: 'CREATE',
                    performedById: req.user.id,
                    details: `تم إنشاء مسودة الفاتورة رقم ${invoiceNumber} بقيمة إجمالية ${totals.totalAmount} ج.م`,
                },
            });
            return created;
        });
        res.status(201).json({
            success: true,
            data: invoice,
            message: `تم إنشاء الفاتورة رقم ${invoiceNumber} بنجاح كمسودة`,
        });
    }
    catch (error) {
        console.error('createInvoice error:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء إنشاء الفاتورة' });
    }
};
exports.createInvoice = createInvoice;
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const existing = await prismaClient_js_1.default.invoice.findUnique({
            where: { id },
            include: { items: true, approvalSteps: true },
        });
        if (!existing) {
            res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
            return;
        }
        if (existing.status === client_1.InvoiceStatus.PAID || existing.status === client_1.InvoiceStatus.CANCELLED) {
            res.status(400).json({
                success: false,
                message: 'لا يمكن تعديل فاتورة مسددة أو ملغاة',
            });
            return;
        }
        const parseResult = createInvoiceSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const data = parseResult.data;
        const totals = (0, exports.computeInvoiceTotals)(data.items, data.discountAmount, data.taxRate, data.applyWht);
        // CRITICAL BUSINESS RULE:
        // "أي تعديل في المبلغ بعد الاعتماد يلغي الاعتماد ويرجّعها للمراجعة"
        const wasApprovedOrIssued = existing.status === client_1.InvoiceStatus.APPROVED || existing.status === client_1.InvoiceStatus.ISSUED;
        const updated = await prismaClient_js_1.default.$transaction(async (tx) => {
            // Delete old items & recreate
            await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
            let newStatus = existing.status;
            let auditMessage = `تم تعديل بيانات الفاتورة رقم ${existing.invoiceNumber}`;
            if (wasApprovedOrIssued) {
                newStatus = client_1.InvoiceStatus.PENDING_APPROVAL;
                // Void previous approvals
                await tx.approvalStep.updateMany({
                    where: { invoiceId: id },
                    data: {
                        status: 'PENDING',
                        comments: 'تم إلغاء الاعتماد تلقائياً لإعادة المراجعة بسبب تعديل القيم المالية',
                        actionDate: null,
                    },
                });
                // Remove previously frozen taxes to be re-frozen on new approval
                await tx.invoiceTax.deleteMany({ where: { invoiceId: id } });
                auditMessage = `[تنبيه أمان مالي] تم إلغاء اعتماد الفاتورة رقم ${existing.invoiceNumber} وإعادتها للمراجعة بسبب تعديل القيم المالية من قِبل ${req.user.name}`;
            }
            const inv = await tx.invoice.update({
                where: { id },
                data: {
                    clientId: data.clientId,
                    dueDate: new Date(data.dueDate),
                    subtotal: totals.subtotal,
                    discountAmount: data.discountAmount,
                    taxAmount: totals.totalTax,
                    totalAmount: totals.totalAmount,
                    remainingBalance: totals.totalAmount - Number(existing.paidAmount),
                    status: newStatus,
                    notes: data.notes,
                    terms: data.terms,
                    items: {
                        create: data.items.map((item) => ({
                            serviceId: item.serviceId || null,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            discount: item.discount,
                            total: Math.round((item.quantity * item.unitPrice - item.discount) * 100) / 100,
                        })),
                    },
                },
            });
            await tx.auditLog.create({
                data: {
                    entity: 'INVOICE',
                    entityId: id,
                    action: wasApprovedOrIssued ? 'VOID_APPROVAL_ON_EDIT' : 'UPDATE',
                    performedById: req.user.id,
                    details: auditMessage,
                },
            });
            return inv;
        });
        res.json({
            success: true,
            data: updated,
            message: wasApprovedOrIssued
                ? 'تم تعديل الفاتورة وإلغاء الاعتماد السابق وإعادتها لمسار المراجعة بنجاح'
                : 'تم حفظ تعديلات الفاتورة بنجاح',
        });
    }
    catch (error) {
        console.error('updateInvoice error:', error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث الفاتورة' });
    }
};
exports.updateInvoice = updateInvoice;
const cancelInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const existing = await prismaClient_js_1.default.invoice.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
            return;
        }
        if (Number(existing.paidAmount) > 0) {
            res.status(400).json({
                success: false,
                message: 'لا يمكن إلغاء فاتورة تم تسجيل مدفوعات عليها',
            });
            return;
        }
        const cancelled = await prismaClient_js_1.default.$transaction(async (tx) => {
            const inv = await tx.invoice.update({
                where: { id },
                data: { status: client_1.InvoiceStatus.CANCELLED },
            });
            await tx.auditLog.create({
                data: {
                    entity: 'INVOICE',
                    entityId: id,
                    action: 'CANCEL',
                    performedById: req.user.id,
                    details: `تم إلغاء الفاتورة ${existing.invoiceNumber}. السبب: ${reason || 'غير محدد'}`,
                },
            });
            return inv;
        });
        res.json({ success: true, data: cancelled, message: 'تم إلغاء الفاتورة بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في إلغاء الفاتورة' });
    }
};
exports.cancelInvoice = cancelInvoice;
