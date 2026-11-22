
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prismaClient.js';
import { requireWritePermission } from '../middleware/auth.js';

const router = Router();

const supplierSchema = z.object({
  name: z.string().trim().min(2, 'اسم المورد مطلوب'),
  taxNumber: z.string().trim().optional(),
});

// Verify authenticated user has Media system access.
// Read-only users are allowed.
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

    console.error('Media supplier authorization error:', error);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من الصلاحيات',
    });
  }
}

// List all suppliers
router.get(
  '/',
  requireMediaReadAccess,
  async (req: Request, res: Response) => {
    try {
      const suppliers = await prisma.mediaSupplier.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              records: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      console.error('get suppliers error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الموردين',
      });
    }
  }
);

// Create supplier
router.post(
  '/',
  requireWritePermission,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = supplierSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          errors: parsed.error.errors,
        });
        return;
      }

      const cleanName = parsed.data.name;
      const taxNumber = parsed.data.taxNumber || null;

      const existing = await prisma.mediaSupplier.findUnique({
        where: {
          name: cleanName,
        },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: 'هذا المورد مسجل بالفعل',
        });
        return;
      }

      const supplier = await prisma.mediaSupplier.create({
        data: {
          name: cleanName,
          taxNumber,
        },
      });

      res.status(201).json({
        success: true,
        data: supplier,
        message: 'تمت إضافة المورد بنجاح',
      });
    } catch (error) {
      console.error('create supplier error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء إضافة المورد',
      });
    }
  }
);

// Delete supplier
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
          message: 'معرف المورد غير صالح',
        });
        return;
      }

      const existing = await prisma.mediaSupplier.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'المورد غير موجود',
        });
        return;
      }

      await prisma.mediaSupplier.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'تم حذف المورد بنجاح',
      });
    } catch (error: any) {
      console.error('delete supplier error:', error);

      if (error?.code === 'P2003') {
        res.status(409).json({
          success: false,
          message: 'لا يمكن حذف المورد لوجود سجلات مرتبطة به',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء حذف المورد',
      });
    }
  }
);

export default router;
