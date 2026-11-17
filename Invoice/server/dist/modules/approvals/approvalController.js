"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingApprovals = exports.rejectInvoice = exports.approveInvoice = exports.submitForApproval = void 0;
const zod_1 = require("zod");
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const client_1 = require("@prisma/client");
const submitForApproval = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const invoice = await prismaClient_js_1.default.invoice.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!invoice) {
            res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
            return;
        }
        if (invoice.status !== client_1.InvoiceStatus.DRAFT) {
            res.status(400).json({
                success: false,
                message: 'يمكن إرسال الفواتير التي في حالة مسودة (Draft) فقط للاعتماد',
            });
            return;
        }
        const amount = Number(invoice.totalAmount);
        // Fetch dynamic approval rules from DB
        const applicableRules = await prismaClient_js_1.default.approvalRule.findMany({
            where: {
                isActive: true,
                minAmount: { lte: amount },
            },
            orderBy: { levelOrder: 'asc' },
        });
        if (applicableRules.length === 0) {
            res.status(400).json({
                success: false,
                message: 'لا توجد قواعد اعتماد مطابقة لقيمة هذه الفاتورة. يرجى مراجعة مسؤول النظام لضبط approval_rules',
            });
            return;
        }
        // Determine target rule: rule where amount falls in [minAmount, maxAmount]
        const targetRule = applicableRules.find((r) => amount >= Number(r.minAmount) && amount <= Number(r.maxAmount)) || applicableRules[applicableRules.length - 1];
        await prismaClient_js_1.default.$transaction(async (tx) => {
            // Clear any previous pending steps
            await tx.approvalStep.deleteMany({ where: { invoiceId: id } });
            // Create step for the required tier
            await tx.approvalStep.create({
                data: {
                    invoiceId: id,
                    ruleId: targetRule.id,
                    levelOrder: targetRule.levelOrder,
                    status: client_1.ApprovalStatus.PENDING,
                },
            });
            // Update invoice status
            await tx.invoice.update({
                where: { id },
                data: { status: client_1.InvoiceStatus.PENDING_APPROVAL },
            });
            // Audit Log
            await tx.auditLog.create({
                data: {
                    entity: 'INVOICE',
                    entityId: id,
                    action: 'SUBMIT_FOR_APPROVAL',
                    performedById: req.user.id,
                    details: `تم تقديم الفاتورة رقم ${invoice.invoiceNumber} للاعتماد في المستوى ${targetRule.levelOrder} (${targetRule.description || targetRule.requiredRole})`,
                },
            });
        });
        res.json({
            success: true,
            message: `تم إرسال الفاتورة بنجاح للاعتماد (المستوى ${targetRule.levelOrder} - ${targetRule.requiredRole})`,
        });
    }
    catch (error) {
        console.error('submitForApproval error:', error);
        res.status(500).json({ success: false, message: 'خطأ أثناء إرسال الفاتورة للاعتماد' });
    }
};
exports.submitForApproval = submitForApproval;
const approveSchema = zod_1.z.object({
    comments: zod_1.z.string().optional(),
});
const approveInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const parseResult = approveSchema.safeParse(req.body);
        const comments = parseResult.success ? parseResult.data.comments : undefined;
        const invoice = await prismaClient_js_1.default.invoice.findUnique({
            where: { id },
            include: {
                approvalSteps: {
                    where: { status: client_1.ApprovalStatus.PENDING },
                    include: { rule: true },
                    orderBy: { levelOrder: 'asc' },
                },
                items: true,
            },
        });
        if (!invoice) {
            res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
            return;
        }
        if (invoice.status !== client_1.InvoiceStatus.PENDING_APPROVAL) {
            res.status(400).json({
                success: false,
                message: 'الفاتورة ليست في حالة انتظار الاعتماد',
            });
            return;
        }
        // STRICT BUSINESS RULE: SEPARATION OF DUTIES
        // "مفيش حد يعتمد فاتورة هو اللي أنشأها"
        if (invoice.createdById === req.user.id) {
            res.status(403).json({
                success: false,
                message: 'غير مسموح نظاماً: لا يمكنك اعتماد فاتورة قمت أنت بإنشائها بنفسك (مبدأ فصل المهام)',
            });
            return;
        }
        const pendingStep = invoice.approvalSteps[0];
        if (!pendingStep) {
            res.status(400).json({
                success: false,
                message: 'لا توجد خطوة اعتماد معلقة لهذه الفاتورة',
            });
            return;
        }
        // Check Role Authority
        // Admin has super approval power; otherwise role must match or exceed requiredRole
        const userRole = req.user.role;
        const requiredRole = pendingStep.rule?.requiredRole;
        const roleHierarchies = {
            SALES: 1,
            ACCOUNTANT: 2,
            FINANCE_MANAGER: 3,
            ADMIN: 4,
        };
        if (userRole !== client_1.UserRole.ADMIN &&
            roleHierarchies[userRole] < (requiredRole ? roleHierarchies[requiredRole] : 3)) {
            res.status(403).json({
                success: false,
                message: `هذا المستوى من الفواتير يتطلب اعتماد رتبة (${requiredRole}) أو أعلى`,
            });
            return;
        }
        // Execute approval and freeze taxes!
        await prismaClient_js_1.default.$transaction(async (tx) => {
            // 1. Update step
            await tx.approvalStep.update({
                where: { id: pendingStep.id },
                data: {
                    status: client_1.ApprovalStatus.APPROVED,
                    approverId: req.user.id,
                    comments: comments || 'تم الاعتماد بنجاح',
                    actionDate: new Date(),
                },
            });
            // 2. Freeze taxes into `invoice_taxes` table
            // Clear existing in case of re-approval
            await tx.invoiceTax.deleteMany({ where: { invoiceId: id } });
            const vatAmount = Number(invoice.taxAmount);
            // Standard VAT 14%
            await tx.invoiceTax.create({
                data: {
                    invoiceId: id,
                    taxName: 'ضريبة القيمة المضافة (VAT 14%)',
                    taxRate: 14.00,
                    taxAmount: vatAmount,
                    isWithholding: false,
                },
            });
            // 3. Update invoice status to ISSUED
            await tx.invoice.update({
                where: { id },
                data: {
                    status: client_1.InvoiceStatus.ISSUED,
                },
            });
            // 4. Audit Log
            await tx.auditLog.create({
                data: {
                    entity: 'INVOICE',
                    entityId: id,
                    action: 'APPROVE_AND_ISSUE',
                    performedById: req.user.id,
                    details: `تم اعتماد الفاتورة رقم ${invoice.invoiceNumber} بقيمة ${invoice.totalAmount} ج.م وإصدارها رسمياً وتجميد الضرائب بواسطة ${req.user.name} (${req.user.role})`,
                },
            });
        });
        res.json({
            success: true,
            message: `تم اعتماد وإصدار الفاتورة رقم ${invoice.invoiceNumber} بنجاح وتجميد الضرائب`,
        });
    }
    catch (error) {
        console.error('approveInvoice error:', error);
        res.status(500).json({ success: false, message: 'خطأ أثناء اعتماد الفاتورة' });
    }
};
exports.approveInvoice = approveInvoice;
const rejectInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        if (!comments || comments.trim().length === 0) {
            res.status(400).json({ success: false, message: 'يجب ذكر سبب الرفض في الملاحظات' });
            return;
        }
        const invoice = await prismaClient_js_1.default.invoice.findUnique({
            where: { id },
            include: {
                approvalSteps: {
                    where: { status: client_1.ApprovalStatus.PENDING },
                },
            },
        });
        if (!invoice) {
            res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
            return;
        }
        const pendingStep = invoice.approvalSteps[0];
        await prismaClient_js_1.default.$transaction(async (tx) => {
            if (pendingStep) {
                await tx.approvalStep.update({
                    where: { id: pendingStep.id },
                    data: {
                        status: client_1.ApprovalStatus.REJECTED,
                        approverId: req.user.id,
                        comments,
                        actionDate: new Date(),
                    },
                });
            }
            await tx.invoice.update({
                where: { id },
                data: { status: client_1.InvoiceStatus.DRAFT },
            });
            await tx.auditLog.create({
                data: {
                    entity: 'INVOICE',
                    entityId: id,
                    action: 'REJECT',
                    performedById: req.user.id,
                    details: `تم رفض الفاتورة رقم ${invoice.invoiceNumber} وإعادتها لمسودة. السبب: ${comments}`,
                },
            });
        });
        res.json({
            success: true,
            message: 'تم رفض الفاتورة وإعادتها إلى مسودة للتعديل',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ أثناء رفض الفاتورة' });
    }
};
exports.rejectInvoice = rejectInvoice;
const getPendingApprovals = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'غير مصرح' });
            return;
        }
        const currentUserId = req.user.id;
        // Fetch invoices pending approval where current user is NOT creator
        const invoices = await prismaClient_js_1.default.invoice.findMany({
            where: {
                status: client_1.InvoiceStatus.PENDING_APPROVAL,
                createdById: { not: currentUserId }, // Enforce separation of duties
            },
            include: {
                client: {
                    select: { id: true, name: true, companyName: true },
                },
                createdBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
                approvalSteps: {
                    where: { status: client_1.ApprovalStatus.PENDING },
                    include: { rule: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: invoices });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب طلبات الاعتماد' });
    }
};
exports.getPendingApprovals = getPendingApprovals;
