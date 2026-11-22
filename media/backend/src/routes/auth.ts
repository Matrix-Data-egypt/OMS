
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

interface MediaUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  passwordHash?: string;
  role: string;
  systemAccess: string;
  isActive: boolean;
  phone: string | null;
}

function hasMediaAccess(user: MediaUser): boolean {
  if (user.role === 'MEDIA_ADMIN') {
    return user.systemAccess === 'MEDIA';
  }

  return (
    user.systemAccess === 'MEDIA' ||
    user.systemAccess === 'ALL'
  );
}

function isUserReadOnly(user: MediaUser): boolean {
  return (
    user.username === 'manager' ||
    user.username === 'مدير' ||
    (typeof user.name === 'string' &&
      user.name.includes('عرض فقط'))
  );
}

function getJwtSecret(): string | null {
  return process.env.JWT_SECRET || null;
}

function createUserResponse(user: MediaUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    systemAccess: user.systemAccess,
    isReadOnly: isUserReadOnly(user),
    phone: user.phone,
  };
}

// ==========================================
// Media Login
// ==========================================

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errors: parsed.error.errors,
      });
      return;
    }

    const {
      username,
      email,
      loginIdentifier,
      password,
    } = parsed.data;

    const identifier = (
      loginIdentifier || username || email || ''
    ).trim();

    if (!identifier) {
      res.status(400).json({
        success: false,
        message: 'اسم المستخدم أو البريد الإلكتروني مطلوب',
      });
      return;
    }

    const secret = getJwtSecret();

    if (!secret) {
      console.error('JWT_SECRET is not configured');

      res.status(500).json({
        success: false,
        message: 'إعدادات المصادقة غير مكتملة',
      });
      return;
    }

    const users = await prisma.$queryRaw<MediaUser[]>`
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
      WHERE
        (
          email IS NOT NULL
          AND LOWER(email) = LOWER(${identifier})
        )
        OR
        (
          username IS NOT NULL
          AND LOWER(username) = LOWER(${identifier})
        )
        OR
        (
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

    if (!user.passwordHash) {
      res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
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
        role: user.role,
        systemAccess: user.systemAccess,
        isReadOnly,
      },
      secret,
      {
        expiresIn: '7d',
        issuer: 'MDE-OMS-Media',
        audience: 'OMS-Media-API',
      }
    );

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح إلى قسم الميديا',
      data: {
        token,
        user: createUserResponse(user),
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

    if (!authHeader?.startsWith('Bearer ')) {
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

    const secret = getJwtSecret();

    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'إعدادات المصادقة غير مكتملة',
      });
      return;
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'MDE-OMS-Media',
      audience: 'OMS-Media-API',
    }) as jwt.JwtPayload;

    if (!decoded.id || typeof decoded.id !== 'string') {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح',
      });
      return;
    }

    // Always load the latest account data from the database.
    const users = await prisma.$queryRaw<MediaUser[]>`
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

    if (!users || users.length === 0) {
      res.status(403).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
      return;
    }

    const user = users[0];

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'هذا الحساب غير مفعّل',
      });
      return;
    }

    if (!hasMediaAccess(user)) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح بالدخول إلى نظام الميديا',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: createUserResponse(user),
    });
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      res.status(401).json({
        success: false,
        message: 'جلسة الدخول غير صالحة أو منتهية',
      });
      return;
    }

    console.error('Media profile error:', error);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل بيانات المستخدم',
    });
  }
});

export default router;
