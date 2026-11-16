import { Router, Request, Response } from 'express';
import prisma from '../prisma/prismaClient.js';
import crypto from 'crypto';

const router = Router();

// Create Accounting Invoice from Media Campaign / Record
router.post('/create-invoice-from-media', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mediaRecordId, dueDays = 15 } = req.body;

    if (!mediaRecordId) {
      res.status(400).json({ success: false, message: 'معرف سجل الميديا مطلوب' });
      return;
    }

    const record = await prisma.mediaRecord.findUnique({
      where: { id: mediaRecordId },
      include: {
        client: true,
        channel: true,
        supplier: true,
        content: { include: { contentType: true } },
      },
    });

    if (!record) {
      res.status(404).json({ success: false, message: 'سجل الميديا غير موجود' });
      return;
    }

    if (record.invoiceId) {
      res.status(400).json({
        success: false,
        message: 'تم بالفعل إصدار فاتورة محاسبية لهذه الحملة سابقاً',
      });
      return;
    }

    // Check if client exists in accounting database (public.clients table) or create one
    let accountingClient = await prisma.$queryRaw<any[]>`
      SELECT id, name FROM "public"."clients" WHERE "name" = ${record.client.name} LIMIT 1
    `;

    let clientId: string;
    if (accountingClient.length > 0) {
      clientId = accountingClient[0].id;
      // Update taxNumber in accounting client if media client has one and accounting client doesn't
      if (record.client.taxNumber) {
        await prisma.$executeRaw`
          UPDATE "public"."clients" SET "taxNumber" = ${record.client.taxNumber} WHERE "id" = ${clientId}
        `;
      }
    } else {
      // Create new client in accounting public.clients table
      const newClientId = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "public"."clients" ("id", "name", "companyName", "taxNumber", "notes", "isActive", "createdAt", "updatedAt")
        VALUES (${newClientId}, ${record.client.name}, ${record.client.name}, ${record.client.taxNumber || null}, 'عميل مسجل تلقائياً عبر قسم الميديا', true, NOW(), NOW())
      `;
      clientId = newClientId;
    }

    // Find a system user to assign createdById (Admin or first user in public.users)
    const users = await prisma.$queryRaw<any[]>`
      SELECT id FROM "public"."users" LIMIT 1
    `;
    const defaultUserId = users.length > 0 ? users[0].id : crypto.randomUUID();

    // Generate Invoice Number (e.g. OMS-2026-0001)
    const year = new Date().getFullYear();
    const countResult = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as cnt FROM "public"."invoices" WHERE "invoiceNumber" LIKE ${`OMS-${year}-%`}
    `;
    const seq = String((countResult[0]?.cnt || 0) + 1).padStart(4, '0');
    const invoiceNumber = `OMS-${year}-${seq}`;

    // Calculations:
    // Amount charged to client: netToClient if provided (>0), otherwise cost
    const invoiceSubtotal = Number(record.netToClient) > 0 
      ? Number(record.netToClient) 
      : (Number(record.cost) > 0 ? Number(record.cost) : 0);
    
    const vatAmount = Math.round((invoiceSubtotal * 0.14) * 100) / 100; // 14% VAT
    const totalAmount = Math.round((invoiceSubtotal + vatAmount) * 100) / 100;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

    const invoiceId = crypto.randomUUID();
    const itemId = crypto.randomUUID();
    const taxId = crypto.randomUUID();
    const auditId = crypto.randomUUID();

    // 1. Insert Invoice in public.invoices
    await prisma.$executeRaw`
      INSERT INTO "public"."invoices" (
        "id", "invoiceNumber", "clientId", "createdById", "status", "issueDate", "dueDate",
        "subtotal", "discountAmount", "taxAmount", "totalAmount", "paidAmount", "remainingBalance",
        "currency", "notes", "terms", "createdAt", "updatedAt"
      ) VALUES (
        ${invoiceId}, ${invoiceNumber}, ${clientId}, ${defaultUserId}, 'DRAFT'::"public"."InvoiceStatus", NOW(), ${dueDate},
        ${invoiceSubtotal}, 0.00, ${vatAmount}, ${totalAmount}, 0.00, ${totalAmount},
        'EGP', ${`فاتورة صادرة عن قسم الميديا: ${record.title || record.content?.name || 'حملة إعلانية'} (${record.month})`},
        'شروط السداد: خلال 15 يوماً من تاريخ الإصدار بالجنيه المصري', NOW(), NOW()
      )
    `;

    // 2. Insert Invoice Item in public.invoice_items
    const channelName = record.channel?.name || 'منصة ميديا';
    const contentName = record.content?.name || 'محتوى إعلاني';
    const typeName = record.content?.contentType?.name || 'إعلان';
    const itemDesc = `تنفيذ حملة ميديا (${channelName} - ${contentName} - ${typeName}) شهر: ${record.month}`;

    await prisma.$executeRaw`
      INSERT INTO "public"."invoice_items" (
        "id", "invoiceId", "description", "quantity", "unitPrice", "discount", "total", "createdAt"
      ) VALUES (
        ${itemId}, ${invoiceId}, ${itemDesc}, 1.00, ${invoiceSubtotal}, 0.00, ${invoiceSubtotal}, NOW()
      )
    `;

    // 3. Insert Invoice Tax (14% VAT) in public.invoice_taxes
    await prisma.$executeRaw`
      INSERT INTO "public"."invoice_taxes" (
        "id", "invoiceId", "taxName", "taxRate", "taxAmount", "isWithholding", "createdAt"
      ) VALUES (
        ${taxId}, ${invoiceId}, 'ضريبة القيمة المضافة (14%)', 14.00, ${vatAmount}, false, NOW()
      )
    `;

    // 4. Insert Audit Log in public.audit_logs
    await prisma.$executeRaw`
      INSERT INTO "public"."audit_logs" ("id", "entity", "entityId", "action", "performedById", "details", "createdAt")
      VALUES (${auditId}, 'INVOICE', ${invoiceId}, 'CREATE_FROM_MEDIA', ${defaultUserId}, ${`تم إصدار مسودة فاتورة من قسم الميديا رقم ${invoiceNumber} بمبلغ ${totalAmount} ج.م`}, NOW())
    `;

    // 5. Update Media Record with invoice link & status
    await prisma.mediaRecord.update({
      where: { id: mediaRecordId },
      data: {
        invoiceId,
        status: 'INVOICED',
      },
    });

    res.json({
      success: true,
      message: `تم إنشاء الفاتورة المحاسبية رقم (${invoiceNumber}) بنجاح وربطها مع قسم الميديا`,
      data: {
        invoiceId,
        invoiceNumber,
        subtotal: invoiceSubtotal,
        totalAmount,
        vatAmount,
      },
    });
  } catch (error: any) {
    console.error('create-invoice-from-media error:', error);
    res.status(500).json({ 
      success: false, 
      message: error?.message || 'خطأ أثناء إنشاء الفاتورة المحاسبية' 
    });
  }
});

// Get linked accounting invoices
router.get('/linked-invoices', async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.$queryRaw<any[]>`
      SELECT i.id, i."invoiceNumber", i.status, i."totalAmount", i."paidAmount", i."remainingBalance", i."dueDate",
             c.name as "clientName"
      FROM "public"."invoices" i
      JOIN "public"."clients" c ON c.id = i."clientId"
      WHERE i.notes LIKE '%قسم الميديا%'
      ORDER BY i."createdAt" DESC
      LIMIT 50
    `;

    res.json({ success: true, data: invoices });
  } catch (error: any) {
    console.error('linked-invoices error:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب فواتير قسم المحاسبة' });
  }
});

export default router;
