import { Response } from 'express';
import prisma from '../../prisma/prismaClient.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { InvoiceStatus } from '@prisma/client';

export const getFinancialOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const allInvoices = await prisma.invoice.findMany({
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
      if (inv.status === InvoiceStatus.CANCELLED) continue;

      if (inv.status === InvoiceStatus.DRAFT) draftCount++;
      if (inv.status === InvoiceStatus.PENDING_APPROVAL) pendingApprovalCount++;
      if (inv.status === InvoiceStatus.PAID) paidCount++;

      if (
        inv.status === InvoiceStatus.ISSUED ||
        inv.status === InvoiceStatus.PARTIALLY_PAID ||
        inv.status === InvoiceStatus.PAID
      ) {
        totalBilled += Number(inv.totalAmount);
        totalCollected += Number(inv.paidAmount);
        totalOutstanding += Number(inv.remainingBalance);

        if (
          (inv.status === InvoiceStatus.ISSUED || inv.status === InvoiceStatus.PARTIALLY_PAID) &&
          Number(inv.remainingBalance) > 0 &&
          new Date(inv.dueDate) < now
        ) {
          totalOverdue += Number(inv.remainingBalance);
          overdueCount++;
        }
      }
    }

    const totalClients = await prisma.client.count({ where: { isActive: true } });
    const totalServices = await prisma.service.count({ where: { isActive: true } });

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
  } catch (error: any) {
    console.error('getFinancialOverview error:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب المؤشرات المالية' });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب سجل العمليات' });
  }
};
