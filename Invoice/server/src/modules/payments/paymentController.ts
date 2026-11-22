import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../prisma/prismaClient.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive('المبلغ المدفوع يجب أن يكون أكبر من صفر'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.BANK_TRANSFER),
  paymentDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const recordPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
      return;
    }

    if (
      invoice.status === InvoiceStatus.DRAFT ||
      invoice.status === InvoiceStatus.PENDING_APPROVAL ||
      invoice.status === InvoiceStatus.CANCELLED
    ) {
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
    const newStatus = newRemainingBalance <= 0.01 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          paymentMethod,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          referenceNumber,
          notes,
          recordedById: req.user!.id,
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
          performedById: req.user!.id,
          details: `تم تسجيل دفعة بقيمة ${amount} ج.م على الفاتورة ${invoice.invoiceNumber}. المتبقي: ${newRemainingBalance} ج.م`,
        },
      });

      return createdPayment;
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: `تم تسجيل الدفعة بنجاح (${amount} ج.م). حالة الفاتورة: ${
        newStatus === InvoiceStatus.PAID ? 'مسددة بالكامل' : 'مسددة جزئياً'
      }`,
    });
  } catch (error: any) {
    console.error('recordPayment error:', error);
    res.status(500).json({ success: false, message: 'خطأ أثناء تسجيل الدفعة' });
  }
};

export const getPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.query;
    const where: any = {};
    if (invoiceId && typeof invoiceId === 'string') {
      where.invoiceId = invoiceId;
    }

    const payments = await prisma.payment.findMany({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب سجل المدفوعات' });
  }
};
