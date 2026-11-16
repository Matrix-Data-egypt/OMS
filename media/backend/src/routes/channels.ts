import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';

const router = Router();

const channelSchema = z.object({
  name: z.string().min(2, 'اسم القناة الإعلانية مطلوب'),
});

// List all channels
router.get('/', async (req: Request, res: Response) => {
  try {
    const channels = await prisma.mediaChannel.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { records: true } },
      },
    });
    res.json({ success: true, data: channels });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب القنوات الإعلانية' });
  }
});

// Create channel (Name only)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = channelSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.errors });
      return;
    }

    const existing = await prisma.mediaChannel.findUnique({
      where: { name: parsed.data.name.trim() },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'هذه القناة مسجلة بالفعل' });
      return;
    }

    const channel = await prisma.mediaChannel.create({
      data: { name: parsed.data.name.trim() },
    });

    res.status(201).json({ success: true, data: channel, message: 'تمت إضافة القناة بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء إضافة القناة' });
  }
});

// Delete channel
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.mediaChannel.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف القناة بنجاح' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء حذف القناة' });
  }
});

export default router;
