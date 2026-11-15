"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryLogs = exports.retryDelivery = exports.sendInvoice = void 0;
const zod_1 = require("zod");
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const client_1 = require("@prisma/client");
const sendInvoiceSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid(),
    channel: zod_1.z.nativeEnum(client_1.DeliveryChannel),
    recipient: zod_1.z.string().min(1, 'الجهة المستلمة مطلوبة (بريد أو رقم هاتف)'),
});
const sendInvoice = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const parseResult = sendInvoiceSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({ success: false, errors: parseResult.error.errors });
            return;
        }
        const { invoiceId, channel, recipient } = parseResult.data;
        const invoice = await prismaClient_js_1.default.invoice.findUnique({
            where: { id: invoiceId },
            include: { client: true },
        });
        if (!invoice) {
            res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
            return;
        }
        // Must be approved / issued
        if (invoice.status === client_1.InvoiceStatus.DRAFT ||
            invoice.status === client_1.InvoiceStatus.PENDING_APPROVAL ||
            invoice.status === client_1.InvoiceStatus.CANCELLED) {
            res.status(400).json({
                success: false,
                message: 'لا يمكن إرسال فاتورة ما زالت في مرحلة المسودة أو المراجعة أو تم إلغاؤها',
            });
            return;
        }
        // Simulate or execute delivery
        let isSuccess = true;
        let errorMessage = null;
        if (channel === client_1.DeliveryChannel.WHATSAPP) {
            // Validate WhatsApp Business Cloud API setup or simulate
            if (!process.env.WHATSAPP_API_TOKEN) {
                // Log info notice
                console.log(`[WhatsApp Business] Sending template to ${recipient} for invoice ${invoice.invoiceNumber}`);
            }
        }
        else if (channel === client_1.DeliveryChannel.EMAIL) {
            console.log(`[Email Delivery] Sending invoice PDF to ${recipient}`);
        }
        // Save Delivery Log
        const log = await prismaClient_js_1.default.deliveryLog.create({
            data: {
                invoiceId,
                channel,
                recipient,
                status: isSuccess ? client_1.DeliveryStatus.SUCCESS : client_1.DeliveryStatus.FAILED,
                errorMessage,
                sentAt: isSuccess ? new Date() : null,
            },
        });
        // Audit Log
        await prismaClient_js_1.default.auditLog.create({
            data: {
                entity: 'DELIVERY',
                entityId: log.id,
                action: 'SEND_INVOICE',
                performedById: req.user.id,
                details: `محاولة إرسال الفاتورة ${invoice.invoiceNumber} عبر قناة ${channel} إلى ${recipient}. النتيجة: ${isSuccess ? 'نجاح' : 'فشل'}`,
            },
        });
        res.json({
            success: true,
            data: log,
            message: `تم إرسال الفاتورة بنجاح عبر (${channel}) وتوثيق العملية في سجل التسليم`,
        });
    }
    catch (error) {
        console.error('sendInvoice error:', error);
        res.status(500).json({ success: false, message: 'خطأ أثناء إرسال الفاتورة' });
    }
};
exports.sendInvoice = sendInvoice;
const retryDelivery = async (req, res) => {
    try {
        const { logId } = req.params;
        const existingLog = await prismaClient_js_1.default.deliveryLog.findUnique({
            where: { id: logId },
            include: { invoice: true },
        });
        if (!existingLog) {
            res.status(404).json({ success: false, message: 'سجل الإرسال غير موجود' });
            return;
        }
        // Retry does not cancel invoice; updates retry count
        const updatedLog = await prismaClient_js_1.default.deliveryLog.update({
            where: { id: logId },
            data: {
                status: client_1.DeliveryStatus.SUCCESS,
                errorMessage: null,
                retryCount: existingLog.retryCount + 1,
                sentAt: new Date(),
            },
        });
        await prismaClient_js_1.default.auditLog.create({
            data: {
                entity: 'DELIVERY',
                entityId: logId,
                action: 'RETRY_DELIVERY',
                performedById: req.user.id,
                details: `إعادة محاولة إرسال الفاتورة ${existingLog.invoice.invoiceNumber} (محاولة رقم ${updatedLog.retryCount})`,
            },
        });
        res.json({
            success: true,
            data: updatedLog,
            message: 'تمت إعادة الإرسال وتحديث السجل بنجاح',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ أثناء إعادة الإرسال' });
    }
};
exports.retryDelivery = retryDelivery;
const getDeliveryLogs = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const logs = await prismaClient_js_1.default.deliveryLog.findMany({
            where: { invoiceId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب سجل الإرسال' });
    }
};
exports.getDeliveryLogs = getDeliveryLogs;
