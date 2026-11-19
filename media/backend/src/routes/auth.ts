
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';

const router = Router();

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  loginIdentifier: z.string().optional(),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

function hasMediaAccess(user: any): boolean {
  if (user.role === 'MEDIA_ADMIN') {
    return user.systemAccess === 'MEDIA';
  }

  return (
    user.systemAccess === 'MEDIA' ||
    user.systemAccess === 'ALL'
  );
}

function isUserReadOnly(user: any): boolean {
  return (
    user.username === 'manager' ||
    user.username === 'مدير' ||
    (user.name && user.name.includes('عرض فقط'))
  );
}

// ==========================================
// Media Login
// ==========================================

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.errors,
      });
      return;
    }

    const { username, email, loginIdentifier, password } = parseResult.data;
    const identifier = (loginIdentifier || username || email || '').trim();

    if (!identifier) {
      res.status(400).json({
        success: false,
        message: 'اسم المستخدم أو البريد الإلكتروني مطلوب',
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

    const users = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        name,
        email,
        username,
        "passwordHash",
        role,
        "systemAccess",
        "isActive",
        phone
      FROM "public"."users"
      WHERE LOWER(email) = LOWER(${identifier})
         OR LOWER(username) = LOWER(${identifier})
         OR (
           ${identifier} = 'مدير'
           AND (username = 'manager' OR username = 'مدير')
         )
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
      });
      return;
    }

    const user = users[0];

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'هذا الحساب غير مفعّل، برجاء مراجعة الإدارة',
      });
      return;
    }

    if (!hasMediaAccess(user)) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح لهذا الحساب بالدخول إلى نظام الميديا',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
      });
      return;
    }

    const isReadOnly = isUserReadOnly(user);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        systemAccess: user.systemAccess,
        isReadOnly,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح إلى قسم الميديا',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          systemAccess: user.systemAccess,
          isReadOnly,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Media login error:', error);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
    });
  }
});

// ==========================================
// Get Current Profile
// ==========================================

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'مطلوب تسجيل الدخول',
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

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded.id || typeof decoded.id !== 'string') {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح',
      });
      return;
    }

    const users = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        name,
        email,
        username,
        role,
        "systemAccess",
        "isActive",
        phone
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

    if (!hasMediaAccess(user)) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح بالدخول إلى نظام الميديا',
      });
      return;
    }

    const isReadOnly = isUserReadOnly(user);

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        systemAccess: user.systemAccess,
        isReadOnly,
        phone: user.phone,
      },
    });
  } catch {
    res.status(401).json({
      success: false,
      message: 'جلسة الدخول غير صالحة أو منتهية',
    });
  }
});

export default router;
