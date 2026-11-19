
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prismaClient.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function requireWritePermission(
  req: AuthenticatedRequest,
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
      SELECT id, name, username, role, "systemAccess", "isActive"
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

    if (
      user.role === 'MEDIA_ADMIN'
        ? user.systemAccess !== 'MEDIA'
        : !['MEDIA', 'ALL'].includes(user.systemAccess)
    ) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالدخول إلى نظام الميديا',
      });
      return;
    }

    const isReadOnly =
      user.username === 'manager' ||
      user.username === 'مدير' ||
      (user.name && user.name.includes('عرض فقط'));

    if (isReadOnly) {
      res.status(403).json({
        success: false,
        message: 'حسابك بصلاحية المشاهدة فقط',
      });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      systemAccess: user.systemAccess,
      isReadOnly,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح أو منتهي',
      });
      return;
    }

    console.error('Authorization middleware error:', error);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من الصلاحيات',
    });
  }
}
