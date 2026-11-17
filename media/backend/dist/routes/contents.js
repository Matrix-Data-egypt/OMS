import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';
import { requireWritePermission } from '../middleware/auth.js';
const router = Router();
const contentSchema = z.object({
    name: z.string().min(2, 'اسم المحتوى مطلوب'),
    contentTypeId: z.string().uuid('معرف نوع المحتوى غير صالح'),
});
// List all contents with their content type
router.get('/', async (req, res) => {
    try {
        const contents = await prisma.mediaContent.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                contentType: true,
                _count: { select: { records: true } },
            },
        });
        res.json({ success: true, data: contents });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب المحتويات' });
    }
});
// Create content
router.post('/', requireWritePermission, async (req, res) => {
    try {
        const parsed = contentSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.errors });
            return;
        }
        const content = await prisma.mediaContent.create({
            data: {
                name: parsed.data.name.trim(),
                contentTypeId: parsed.data.contentTypeId,
            },
            include: { contentType: true },
        });
        res.status(201).json({ success: true, data: content, message: 'تمت إضافة المحتوى بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ أثناء إضافة المحتوى' });
    }
});
// Delete content
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.mediaContent.delete({ where: { id } });
        res.json({ success: true, message: 'تم حذف المحتوى بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ أثناء حذف المحتوى' });
    }
});
export default router;
