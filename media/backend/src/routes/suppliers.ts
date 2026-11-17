import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';
import { requireWritePermission } from '../middleware/auth.js';

const router = Router();

const supplierSchema = z.object({
  name: z.string().min(2, 'اسم المورد مطلوب'),
  taxNumber: z.string().optional(),
});

// List all suppliers
router.get('/', async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.mediaSupplier.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { records: true } },
      },
    });
    res.json({ success: true, data: suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الموردين' });
  }
});

// Create supplier (Name only)
router.post('/', requireWritePermission, async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = supplierSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.errors });
      return;
    }

    const existing = await prisma.mediaSupplier.findUnique({
      where: { name: parsed.data.name.trim() },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'هذا المورد مسجل بالفعل' });
      return;
    }

    const supplier = await prisma.mediaSupplier.create({
      data: {
        name: parsed.data.name.trim(),
        taxNumber: parsed.data.taxNumber?.trim() || null,
      },
    });

    res.status(201).json({ success: true, data: supplier, message: 'تمت إضافة المورد بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إضافة المورد' });
  }
});

// Delete supplier
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.mediaSupplier.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف المورد بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء حذف المورد' });
  }
});

export default router;
