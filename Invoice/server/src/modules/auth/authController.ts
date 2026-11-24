
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import prisma from '../../prisma/prismaClient.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

// ==========================================
// LOGIN VALIDATION
// ==========================================

const loginSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  loginIdentifier: z.string().optional(),
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
});

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request body
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'بيانات تسجيل الدخول غير صحيحة',
        errors: parseResult.error.errors,
      });
      return;
    }

    const {
      email,
      username,
      loginIdentifier,
      password,
    } = parseResult.data;

    // Resolve login identifier
    const identifier = (
      loginIdentifier ||
      username ||
      email ||
      ''
    ).trim();

    if (!identifier) {
      res.status(400).json({
        success: false,
        message: 'اسم المستخدم أو البريد الإلكتروني مطلوب',
      });
      return;
    }

    // ==========================================
    // FIND USER
    // ==========================================

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
      });
      return;
    }

    // ==========================================
    // CHECK ACCOUNT STATUS
    // ==========================================

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'هذا الحساب غير مفعّل',
      });
      return;
    }

    // ==========================================
    // CHECK SYSTEM ACCESS
    // ==========================================

    if (user.systemAccess === 'MEDIA') {
      res.status(403).json({
        success: false,
        message:
          'عفواً، حسابك مخصص لقسم الميديا فقط وغير مصرح له بالدخول إلى نظام الفواتير والمحاسبة.',
      });
      return;
    }

    // ==========================================
    // VERIFY PASSWORD
    // ==========================================

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

    // ==========================================
    // JWT CONFIGURATION
    // ==========================================

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('LOGIN ERROR: JWT_SECRET is missing');

      res.status(500).json({
        success: false,
        message: 'إعدادات المصادقة غير مكتملة',
      });
      return;
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    // ==========================================
    // GENERATE TOKEN
    // ==========================================

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
      {
        expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
      }
    );

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
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
    // ==========================================
    // ERROR LOGGING
    // ==========================================

    console.error('========== LOGIN ERROR ==========');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error meta:', error?.meta);
    console.error('=================================');

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
    });
  }
};

// ==========================================
// GET PROFILE
// GET /api/auth/me
// ==========================================

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'غير مصرح',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
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

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error: any) {
    console.error('========== GET PROFILE ERROR ==========');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('========================================');

    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المستخدم',
    });
  }
};
