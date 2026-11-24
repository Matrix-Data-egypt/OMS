
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
  let loginStage = 'VALIDATION';

  try {
    // 1. Validate request body
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

    // 2. Resolve login identifier
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

    // 3. Check Supabase configuration
    loginStage = 'SUPABASE_CONFIGURATION';

    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_KEY
    ) {
      console.error('LOGIN ERROR: Supabase environment variables are missing');

      res.status(500).json({
        success: false,
        message: 'إعدادات الاتصال بقاعدة البيانات غير مكتملة',
      });
      return;
    }

    // 4. Find user by email first, then username
    loginStage = 'FIND_USER_BY_EMAIL';

    let user = await prisma.user.findFirst({
      where: {
        email: identifier,
      },
    });

    if (!user) {
      loginStage = 'FIND_USER_BY_USERNAME';

      user = await prisma.user.findFirst({
        where: {
          username: identifier,
        },
      });
    }

    console.log('LOGIN USER FOUND:', Boolean(user));

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة',
      });
      return;
    }

    // 5. Check account status
    loginStage = 'CHECK_ACCOUNT_STATUS';

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'هذا الحساب غير مفعّل',
      });
      return;
    }

    // 6. Check system access
    loginStage = 'CHECK_SYSTEM_ACCESS';

    if (user.systemAccess === 'MEDIA') {
      res.status(403).json({
        success: false,
        message:
          'عفواً، حسابك مخصص لقسم الميديا فقط وغير مصرح له بالدخول إلى نظام الفواتير والمحاسبة.',
      });
      return;
    }

    // 7. Verify password hash
    loginStage = 'VERIFY_PASSWORD';

    if (
      typeof user.passwordHash !== 'string' ||
      !user.passwordHash
    ) {
      console.error('LOGIN ERROR: User password hash is missing or invalid');

      res.status(500).json({
        success: false,
        message: 'تعذر التحقق من بيانات الحساب',
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

    // 8. Validate JWT configuration
    loginStage = 'JWT_CONFIGURATION';

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

    // 9. Generate JWT
    loginStage = 'GENERATE_TOKEN';

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

    // 10. Return safe user information
    loginStage = 'SUCCESS_RESPONSE';

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
    console.error('========== LOGIN ERROR ==========');
    console.error('Stage:', loginStage);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error details:', error?.details);
    console.error('Error hint:', error?.hint);
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
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
      return;
    }

    // Never expose passwordHash or other private fields
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      systemAccess: user.systemAccess,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: safeUser,
    });

  } catch (error: any) {
    console.error('========== GET PROFILE ERROR ==========');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error details:', error?.details);
    console.error('========================================');

    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المستخدم',
    });
  }
};
