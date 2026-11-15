"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.getFinancialOverview = void 0;
const prismaClient_js_1 = __importDefault(require("../../prisma/prismaClient.js"));
const client_1 = require("@prisma/client");
const getFinancialOverview = async (req, res) => {
    try {
        const allInvoices = await prismaClient_js_1.default.invoice.findMany({
            select: {
                id: true,
                status: true,
                totalAmount: true,
                paidAmount: true,
                remainingBalance: true,
                dueDate: true,
            },
        });
        const now = new Date();
        let totalBilled = 0;
        let totalCollected = 0;
        let totalOutstanding = 0;
        let totalOverdue = 0;
        let overdueCount = 0;
        let draftCount = 0;
        let pendingApprovalCount = 0;
        let paidCount = 0;
        for (const inv of allInvoices) {
            if (inv.status === client_1.InvoiceStatus.CANCELLED)
                continue;
            if (inv.status === client_1.InvoiceStatus.DRAFT)
                draftCount++;
            if (inv.status === client_1.InvoiceStatus.PENDING_APPROVAL)
                pendingApprovalCount++;
            if (inv.status === client_1.InvoiceStatus.PAID)
                paidCount++;
            if (inv.status === client_1.InvoiceStatus.ISSUED ||
                inv.status === client_1.InvoiceStatus.PARTIALLY_PAID ||
                inv.status === client_1.InvoiceStatus.PAID) {
                totalBilled += Number(inv.totalAmount);
                totalCollected += Number(inv.paidAmount);
                totalOutstanding += Number(inv.remainingBalance);
                if ((inv.status === client_1.InvoiceStatus.ISSUED || inv.status === client_1.InvoiceStatus.PARTIALLY_PAID) &&
                    Number(inv.remainingBalance) > 0 &&
                    new Date(inv.dueDate) < now) {
                    totalOverdue += Number(inv.remainingBalance);
                    overdueCount++;
                }
            }
        }
        const totalClients = await prismaClient_js_1.default.client.count({ where: { isActive: true } });
        const totalServices = await prismaClient_js_1.default.service.count({ where: { isActive: true } });
        res.json({
            success: true,
            data: {
                totalBilled: Math.round(totalBilled * 100) / 100,
                totalCollected: Math.round(totalCollected * 100) / 100,
                totalOutstanding: Math.round(totalOutstanding * 100) / 100,
                totalOverdue: Math.round(totalOverdue * 100) / 100,
                overdueCount,
                draftCount,
                pendingApprovalCount,
                paidCount,
                totalClients,
                totalServices,
                collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
            },
        });
    }
    catch (error) {
        console.error('getFinancialOverview error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب المؤشرات المالية' });
    }
};
exports.getFinancialOverview = getFinancialOverview;
const getAuditLogs = async (req, res) => {
    try {
        const logs = await prismaClient_js_1.default.auditLog.findMany({
            include: {
                performedBy: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.json({ success: true, data: logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب سجل العمليات' });
    }
};
exports.getAuditLogs = getAuditLogs;
