
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prismaClient.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    username: string | null;
    role: string;
    systemAccess: string;
    isReadOnly: boolean;
  };
}

interface DatabaseUser {
  id: string;
  name: string;
  username: string | null;
  role: string;
  systemAccess: string;
  isActive: boolean;
}

const JWT_ISSUER = 'MDE-OMS-Media';
const JWT_AUDIENCE = 'OMS-Media-API';

function isUserReadOnly(user: DatabaseUser): boolean {
  return (
    user.username === 'manager' ||
    user.username === 'مدير' ||
    (typeof user.name === 'string' &&
      user.name.includes('عرض فقط'))
  );
}

function hasMediaAccess(user: DatabaseUser): boolean {
  if (user.role === 'MEDIA_ADMIN') {
    return user.systemAccess === 'MEDIA';
  }

  return (
    user.systemAccess === 'MEDIA' ||
    user.systemAccess === 'ALL'
  );
}

async function authenticate(
  req: AuthenticatedRequest,
  res: Response
): Promise<boolean> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'يجب تسجيل الدخول أولاً',
    });
    return false;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'رمز الدخول غير موجود',
    });
    return false;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: 'إعدادات المصادقة غير مكتملة',
    });
    return false;
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as jwt.JwtPayload;

    if (!decoded.id || typeof decoded.id !== 'string') {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح',
      });
      return false;
    }

    const users = await prisma.$queryRaw<DatabaseUser[]>`
      SELECT
        id,
        name,
        username,
        role,
        "systemAccess",
        "isActive"
      FROM "public"."users"
      WHERE id = ${decoded.id}
      LIMIT 1
    `;

    if (!users || users.length === 0 || !users[0].isActive) {
      res.status(403).json({
        success: false,
        message: 'المستخدم غير موجود أو غير مفعّل',
      });
      return false;
    }

    const user = users[0];

    if (!hasMediaAccess(user)) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالدخول إلى نظام الميديا',
      });
      return false;
    }

    const isReadOnly = isUserReadOnly(user);

    req.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      systemAccess: user.systemAccess,
      isReadOnly,
    };

    return true;
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح أو منتهي',
      });
      return false;
    }

    console.error('Authorization middleware error:', error);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من الصلاحيات',
    });

    return false;
  }
}

// ==========================================
// Read + Write Authentication
// ==========================================

export async function requireMediaAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authenticated = await authenticate(req, res);

  if (!authenticated) return;

  next();
}

// ==========================================
// Write Permission
// ==========================================

export async function requireWritePermission(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authenticated = await authenticate(req, res);

  if (!authenticated) return;

  if (req.user?.isReadOnly) {
    res.status(403).json({
      success: false,
      message: 'حسابك بصلاحية المشاهدة فقط',
    });
    return;
  }

  next();
}
