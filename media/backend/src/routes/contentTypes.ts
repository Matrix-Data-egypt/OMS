
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prismaClient.js';
import { requireWritePermission } from '../middleware/auth.js';

const router = Router();

const contentTypeSchema = z.object({
  name: z.string().trim().min(2, 'اسم نوع المحتوى مطلوب'),
});

// Verify authenticated user has Media system access.
async function requireMediaReadAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'يجب تسجيل الدخول أولاً',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'رمز الدخول غير موجود',
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: 'إعدادات المصادقة غير مكتملة',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded.id || typeof decoded.id !== 'string') {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح',
      });
      return;
    }

    const users = await prisma.$queryRaw<any[]>`
      SELECT id, role, "systemAccess", "isActive"
      FROM "public"."users"
      WHERE id = ${decoded.id}
      LIMIT 1
    `;

    if (!users || users.length === 0 || !users[0].isActive) {
      res.status(403).json({
        success: false,
        message: 'المستخدم غير موجود أو غير مفعّل',
      });
      return;
    }

    const user = users[0];

    const hasAccess =
      user.role === 'MEDIA_ADMIN'
        ? user.systemAccess === 'MEDIA'
        : ['MEDIA', 'ALL'].includes(user.systemAccess);

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالدخول إلى نظام الميديا',
      });
      return;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح أو منتهي',
      });
      return;
    }

    console.error('Media content type authorization error:', error);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من الصلاحيات',
    });
  }
}

// List all content types
router.get(
  '/',
  requireMediaReadAccess,
  async (req: Request, res: Response) => {
    try {
      const types = await prisma.mediaContentType.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              contents: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: types,
      });
    } catch (error) {
      console.error('get content types error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ في جلب أنواع المحتوى',
      });
    }
  }
);

// Create content type
router.post(
  '/',
  requireWritePermission,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = contentTypeSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          errors: parsed.error.errors,
        });
        return;
      }

      const cleanName = parsed.data.name;

      const existing = await prisma.mediaContentType.findUnique({
        where: {
          name: cleanName,
        },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: 'نوع المحتوى هذا مسجل بالفعل',
        });
        return;
      }

      const ct = await prisma.mediaContentType.create({
        data: {
          name: cleanName,
        },
      });

      res.status(201).json({
        success: true,
        data: ct,
        message: 'تمت إضافة نوع المحتوى بنجاح',
      });
    } catch (error) {
      console.error('create content type error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء إضافة نوع المحتوى',
      });
    }
  }
);

// Delete content type
router.delete(
  '/:id',
  requireWritePermission,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      ) {
        res.status(400).json({
          success: false,
          message: 'معرف نوع المحتوى غير صالح',
        });
        return;
      }

      const existing = await prisma.mediaContentType.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'نوع المحتوى غير موجود',
        });
        return;
      }

      await prisma.mediaContentType.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'تم حذف نوع المحتوى بنجاح',
      });
    } catch (error: any) {
      console.error('delete content type error:', error);

      if (error?.code === 'P2003') {
        res.status(409).json({
          success: false,
          message: 'لا يمكن حذف نوع المحتوى لوجود محتويات مرتبطة به',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء حذف نوع المحتوى',
      });
    }
  }
);

export default router;
