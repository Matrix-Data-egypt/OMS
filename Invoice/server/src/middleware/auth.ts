
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import prisma from '../prisma/prismaClient.js';

export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  role: UserRole;
  systemAccess: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'مطلوب تسجيل الدخول (Authentication required)',
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET is missing');
    res.status(500).json({
      success: false,
      message: 'إعدادات المصادقة غير مكتملة',
    });
    return;
  }

  let decoded: JwtPayload;

  // 1. Verify JWT
  try {
    const verified = jwt.verify(token, secret);

    if (typeof verified === 'string' || !verified.id) {
      res.status(403).json({
        success: false,
        message: 'جلسة الدخول غير صالحة',
      });
      return;
    }

    decoded = verified;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'انتهت صلاحية جلسة الدخول، يرجى تسجيل الدخول مرة أخرى',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        message: 'جلسة الدخول غير صالحة',
      });
      return;
    }

    console.error('JWT verification error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من تسجيل الدخول',
    });
    return;
  }

  // 2. Verify user in database
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(decoded.id) },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        systemAccess: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: 'الحساب غير مفعّل أو غير موجود',
      });
      return;
    }

    if (user.systemAccess === 'MEDIA') {
      res.status(403).json({
        success: false,
        message: 'عفواً، هذا الحساب مصرح له بالدخول لقسم الميديا فقط.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      systemAccess: user.systemAccess,
    };

    next();
  } catch (error) {
    console.error('AUTH DATABASE ERROR:', error);

    next(error);
  }
};

// Role-based authorization
export const requireRoles = (roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'غير مصرح',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'ليس لديك الصلاحية الكافية للقيام بهذا الإجراء (Forbidden)',
      });
      return;
    }

    next();
  };
};
