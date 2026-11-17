import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';
import crypto from 'crypto';
import { requireWritePermission } from '../middleware/auth.js';

const router = Router();

const clientSchema = z.object({
  name: z.string().min(2, 'الاسم الكامل للعميل مطلوب'),
  taxNumber: z.string().optional(),
});

// Helper: Sync a media client name & taxNumber into the accounting (public.clients) table
async function syncClientToAccounting(clientName: string, taxNumber?: string | null) {
  try {
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM "public"."clients" WHERE "name" = ${clientName} LIMIT 1
    `;

    if (existing.length === 0) {
      const newId = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "public"."clients" ("id", "name", "companyName", "taxNumber", "notes", "isActive", "createdAt", "updatedAt")
        VALUES (${newId}, ${clientName}, ${clientName}, ${taxNumber || null}, 'عميل مسجل تلقائياً عبر قسم الميديا', true, NOW(), NOW())
      `;
      return { synced: true, id: newId };
    } else if (taxNumber) {
      await prisma.$executeRaw`
        UPDATE "public"."clients" SET "taxNumber" = ${taxNumber} WHERE "id" = ${existing[0].id}
      `;
    }
    return { synced: false, id: existing[0].id };
  } catch (error) {
    console.error('Error syncing client to accounting:', error);
    return { synced: false, error };
  }
}

// List all clients (with flag indicating if synced in accounting)
router.get('/', async (req: Request, res: Response) => {
  try {
    const clients = await prisma.mediaClient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { records: true } },
      },
    });

    // Check accounting sync status for each client
    const accountingClients = await prisma.$queryRaw<any[]>`
      SELECT "name" FROM "public"."clients"
    `;
    const accountingNameSet = new Set(accountingClients.map((c) => c.name));

    const enriched = clients.map((c) => ({
      ...c,
      isSyncedWithAccounting: accountingNameSet.has(c.name),
    }));

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب العملاء' });
  }
});

// Create client (Name only) & automatically sync to Accounting!
router.post('/', requireWritePermission, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.errors });
      return;
    }

    const cleanName = parsed.data.name.trim();

    const existing = await prisma.mediaClient.findUnique({
      where: { name: cleanName },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'هذا العميل مسجل بالفعل في قسم الميديا' });
      return;
    }

    const taxNumber = parsed.data.taxNumber?.trim() || null;

    // 1. Save in Media department
    const client = await prisma.mediaClient.create({
      data: { name: cleanName, taxNumber },
    });

    // 2. Automatically sync in Accounting department (public.clients)
    await syncClientToAccounting(cleanName, taxNumber);

    res.status(201).json({
      success: true,
      data: client,
      message: 'تمت إضافة العميل في قسم الميديا ومزامنته تلقائياً في قسم المحاسبة والفواتير بنجاح!',
    });
  } catch (error: any) {
    console.error('create client error:', error);
    res.status(500).json({ success: false, message: 'خطأ أثناء إضافة العميل' });
  }
});

// Sync ALL media clients to Accounting department in one click
router.post('/sync-all-to-accounting', async (req: Request, res: Response): Promise<void> => {
  try {
    const mediaClients = await prisma.mediaClient.findMany();
    let newSyncCount = 0;

    for (const c of mediaClients) {
      const resSync = await syncClientToAccounting(c.name, c.taxNumber);
      if (resSync.synced) {
        newSyncCount++;
      }
    }

    res.json({
      success: true,
      message: `تم فحص جميع عملاء الميديا (${mediaClients.length} عميل) ومزامنة ${newSyncCount} عميل جديد مع قسم المحاسبة والفواتير بنجاح!`,
      data: {
        totalMediaClients: mediaClients.length,
        newlySyncedCount: newSyncCount,
      },
    });
  } catch (error: any) {
    console.error('sync-all-to-accounting error:', error);
    res.status(500).json({ success: false, message: 'خطأ أثناء مزامنة العملاء مع المحاسبة' });
  }
});

// Delete client
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.mediaClient.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف العميل من قسم الميديا بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء حذف العميل' });
  }
});

export default router;
