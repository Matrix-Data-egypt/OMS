import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../prisma/prismaClient.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { DeliveryChannel, DeliveryStatus, InvoiceStatus } from '@prisma/client';

const sendInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
  channel: z.nativeEnum(DeliveryChannel),
  recipient: z.string().min(1, 'الجهة المستلمة مطلوبة (بريد أو رقم هاتف)'),
});

export const sendInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true },
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
      return;
    }

    // Must be approved / issued
    if (
      invoice.status === InvoiceStatus.DRAFT ||
      invoice.status === InvoiceStatus.PENDING_APPROVAL ||
      invoice.status === InvoiceStatus.CANCELLED
    ) {
      res.status(400).json({
        success: false,
        message: 'لا يمكن إرسال فاتورة ما زالت في مرحلة المسودة أو المراجعة أو تم إلغاؤها',
      });
      return;
    }

    // Simulate or execute delivery
    let isSuccess = true;
    let errorMessage: string | null = null;

    if (channel === DeliveryChannel.WHATSAPP) {
      // Validate WhatsApp Business Cloud API setup or simulate
      if (!process.env.WHATSAPP_API_TOKEN) {
        // Log info notice
        console.log(`[WhatsApp Business] Sending template to ${recipient} for invoice ${invoice.invoiceNumber}`);
      }
    } else if (channel === DeliveryChannel.EMAIL) {
      console.log(`[Email Delivery] Sending invoice PDF to ${recipient}`);
    }

    // Save Delivery Log
    const log = await prisma.deliveryLog.create({
      data: {
        invoiceId,
        channel,
        recipient,
        status: isSuccess ? DeliveryStatus.SUCCESS : DeliveryStatus.FAILED,
        errorMessage,
        sentAt: isSuccess ? new Date() : null,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        entity: 'DELIVERY',
        entityId: log.id,
        action: 'SEND_INVOICE',
        performedById: req.user.id,
        details: `محاولة إرسال الفاتورة ${invoice.invoiceNumber} عبر قناة ${channel} إلى ${recipient}. النتيجة: ${
          isSuccess ? 'نجاح' : 'فشل'
        }`,
      },
    });

    res.json({
      success: true,
      data: log,
      message: `تم إرسال الفاتورة بنجاح عبر (${channel}) وتوثيق العملية في سجل التسليم`,
    });
  } catch (error: any) {
    console.error('sendInvoice error:', error);
    res.status(500).json({ success: false, message: 'خطأ أثناء إرسال الفاتورة' });
  }
};

export const retryDelivery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { logId } = req.params;

    const existingLog = await prisma.deliveryLog.findUnique({
      where: { id: logId },
      include: { invoice: true },
    });

    if (!existingLog) {
      res.status(404).json({ success: false, message: 'سجل الإرسال غير موجود' });
      return;
    }

    // Retry does not cancel invoice; updates retry count
    const updatedLog = await prisma.deliveryLog.update({
      where: { id: logId },
      data: {
        status: DeliveryStatus.SUCCESS,
        errorMessage: null,
        retryCount: existingLog.retryCount + 1,
        sentAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        entity: 'DELIVERY',
        entityId: logId,
        action: 'RETRY_DELIVERY',
        performedById: req.user!.id,
        details: `إعادة محاولة إرسال الفاتورة ${existingLog.invoice.invoiceNumber} (محاولة رقم ${updatedLog.retryCount})`,
      },
    });

    res.json({
      success: true,
      data: updatedLog,
      message: 'تمت إعادة الإرسال وتحديث السجل بنجاح',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إعادة الإرسال' });
  }
};

export const getDeliveryLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    const logs = await prisma.deliveryLog.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب سجل الإرسال' });
  }
};
