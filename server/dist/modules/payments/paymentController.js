"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = exports.recordPayment = void 0;
const zod_1 = require("zod");
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const client_1 = require("@prisma/client");
const recordPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive('المبلغ المدفوع يجب أن يكون أكبر من صفر'),
    paymentMethod: zod_1.z.nativeEnum(client_1.PaymentMethod).default(client_1.PaymentMethod.BANK_TRANSFER),
    paymentDate: zod_1.z.string().optional(),
    referenceNumber: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const recordPayment = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const parseResult = recordPaymentSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const { invoiceId, amount, paymentMethod, paymentDate, referenceNumber, notes } = parseResult.data;
        const invoice = await prismaClient_js_1.default.invoice.findUnique({
            where: { id: invoiceId },
        });
        if (!invoice) {
            res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
            return;
        }
        if (invoice.status === client_1.InvoiceStatus.DRAFT ||
            invoice.status === client_1.InvoiceStatus.PENDING_APPROVAL ||
            invoice.status === client_1.InvoiceStatus.CANCELLED) {
            res.status(400).json({
                success: false,
                message: 'لا يمكن تسجيل دفعة على فاتورة لم يتم اعتمادها وإصدارها رسمياً أو ملغاة',
            });
            return;
        }
        const remaining = Number(invoice.remainingBalance);
        if (amount > remaining + 0.01) {
            res.status(400).json({
                success: false,
                message: `قيمة الدفعة (${amount} ج.م) تتجاوز الرصيد المتبقي على الفاتورة (${remaining} ج.م)`,
            });
            return;
        }
        const newPaidAmount = Number(invoice.paidAmount) + amount;
        const newRemainingBalance = Math.max(0, Number(invoice.totalAmount) - newPaidAmount);
        const newStatus = newRemainingBalance <= 0.01 ? client_1.InvoiceStatus.PAID : client_1.InvoiceStatus.PARTIALLY_PAID;
        const payment = await prismaClient_js_1.default.$transaction(async (tx) => {
            const createdPayment = await tx.payment.create({
                data: {
                    invoiceId,
                    amount,
                    paymentMethod,
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    referenceNumber,
                    notes,
                    recordedById: req.user.id,
                },
            });
            await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    remainingBalance: newRemainingBalance,
                    status: newStatus,
                },
            });
            await tx.auditLog.create({
                data: {
                    entity: 'PAYMENT',
                    entityId: createdPayment.id,
                    action: 'RECORD_PAYMENT',
                    performedById: req.user.id,
                    details: `تم تسجيل دفعة بقيمة ${amount} ج.م على الفاتورة ${invoice.invoiceNumber}. المتبقي: ${newRemainingBalance} ج.م`,
                },
            });
            return createdPayment;
        });
        res.status(201).json({
            success: true,
            data: payment,
            message: `تم تسجيل الدفعة بنجاح (${amount} ج.م). حالة الفاتورة: ${newStatus === client_1.InvoiceStatus.PAID ? 'مسددة بالكامل' : 'مسددة جزئياً'}`,
        });
    }
    catch (error) {
        console.error('recordPayment error:', error);
        res.status(500).json({ success: false, message: 'خطأ أثناء تسجيل الدفعة' });
    }
};
exports.recordPayment = recordPayment;
const getPayments = async (req, res) => {
    try {
        const { invoiceId } = req.query;
        const where = {};
        if (invoiceId && typeof invoiceId === 'string') {
            where.invoiceId = invoiceId;
        }
        const payments = await prismaClient_js_1.default.payment.findMany({
            where,
            include: {
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        totalAmount: true,
                        client: { select: { id: true, name: true, companyName: true } },
                    },
                },
                recordedBy: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { paymentDate: 'desc' },
        });
        res.json({ success: true, data: payments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب سجل المدفوعات' });
    }
};
exports.getPayments = getPayments;
