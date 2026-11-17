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

// Media Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const { username, email, loginIdentifier, password } = parseResult.data;
    const identifier = (loginIdentifier || username || email || '').trim();

    if (!identifier) {
      res.status(400).json({ success: false, message: 'اسم المستخدم أو البريد الإلكتروني مطلوب' });
      return;
    }

    // Query unified users table in public schema
    const users = await prisma.$queryRaw<any[]>`
      SELECT id, name, email, username, "passwordHash", role, "systemAccess", "isActive", phone
      FROM "public"."users"
      WHERE LOWER(email) = LOWER(${identifier}) 
         OR LOWER(username) = LOWER(${identifier})
         OR (${identifier} = 'مدير' AND (username = 'manager' OR username = 'مدير'))
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
      return;
    }

    const user = users[0];

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'هذا الحساب غير مفعّل، برجاء مراجعة الإدارة' });
      return;
    }

    // Strict Separation Check: Invoice-only users cannot access Media
    if (user.systemAccess === 'INVOICE') {
      res.status(403).json({
        success: false,
        message: 'عفواً، حسابك مخصص لقسم الفواتير والمحاسبة فقط وغير مصرح لك بالدخول لقسم الميديا.',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
      return;
    }

    const isReadOnly = user.username === 'manager' || user.username === 'مدير' || (user.name && user.name.includes('عرض فقط'));

    const secret = process.env.JWT_SECRET || 'oms_media_jwt_secret_secure_key_2026_mde';
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
  } catch (error: any) {
    console.error('Media login error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// Get current profile
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'مطلوب تسجيل الدخول' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'oms_media_jwt_secret_secure_key_2026_mde';
    const decoded: any = jwt.verify(token, secret);

    const users = await prisma.$queryRaw<any[]>`
      SELECT id, name, email, username, role, "systemAccess", "isActive", phone
      FROM "public"."users"
      WHERE id = ${decoded.id}
      LIMIT 1
    `;

    if (!users || users.length === 0 || !users[0].isActive) {
      res.status(403).json({ success: false, message: 'المستخدم غير موجود أو غير مفعّل' });
      return;
    }

    const user = users[0];
    if (user.systemAccess === 'INVOICE') {
      res.status(403).json({ success: false, message: 'غير مصرح بالدخول لقسم الميديا' });
      return;
    }

    const isReadOnly = user.username === 'manager' || user.username === 'مدير' || (user.name && user.name.includes('عرض فقط'));

    res.json({ success: true, data: { ...user, isReadOnly } });
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'جلسة الدخول غير صالحة أو منتهية' });
  }
});

export default router;
