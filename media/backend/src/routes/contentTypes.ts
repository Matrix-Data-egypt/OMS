import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';

const router = Router();

const contentTypeSchema = z.object({
  name: z.string().min(2, 'اسم نوع المحتوى مطلوب'),
});

// List all content types (with ID for linking)
router.get('/', async (req: Request, res: Response) => {
  try {
    const types = await prisma.mediaContentType.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { contents: true } },
      },
    });
    res.json({ success: true, data: types });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب أنواع المحتوى' });
  }
});

// Create content type
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = contentTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.errors });
      return;
    }

    const existing = await prisma.mediaContentType.findUnique({
      where: { name: parsed.data.name.trim() },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'نوع المحتوى هذا مسجل بالفعل' });
      return;
    }

    const ct = await prisma.mediaContentType.create({
      data: { name: parsed.data.name.trim() },
    });

    res.status(201).json({ success: true, data: ct, message: 'تمت إضافة نوع المحتوى بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إضافة نوع المحتوى' });
  }
});

// Delete content type
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.mediaContentType.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف نوع المحتوى بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء حذف نوع المحتوى' });
  }
});

export default router;
