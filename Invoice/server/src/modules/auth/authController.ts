import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../../prisma/prismaClient.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const loginSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  loginIdentifier: z.string().optional(),
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const { email, username, loginIdentifier, password } = parseResult.data;
    const identifier = (loginIdentifier || username || email || '').trim();

    if (!identifier) {
      res.status(400).json({ success: false, message: 'اسم المستخدم أو البريد الإلكتروني مطلوب' });
      return;
    }

    // Find by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة أو الحساب غير مفعّل' });
      return;
    }

    // Check system access: Media-only users cannot access the Invoice Accounting system
    if (user.systemAccess === 'MEDIA') {
      res.status(403).json({
        success: false,
        message: 'عفواً، حسابك مخصص ومصرح له بالدخول لقسم الميديا فقط وغير مصرح لك بالدخول لنظام الفواتير والمحاسبة.',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'oms_jwt_secret_super_secure_key_2026_mde';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        systemAccess: user.systemAccess,
      },
      secret,
      { expiresIn: expiresIn as any }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          systemAccess: user.systemAccess,
          phone: user.phone,
        },
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'غير مصرح' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        systemAccess: true,
        phone: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب بيانات المستخدم' });
  }
};
