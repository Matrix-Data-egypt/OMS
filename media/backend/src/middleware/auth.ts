
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function requireWritePermission(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
    const decoded = jwt.verify(token, secret) as any;

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      !decoded.id
    ) {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح',
      });
      return;
    }

    if (
      decoded.systemAccess !== 'MEDIA' &&
      decoded.systemAccess !== 'ALL'
    ) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالدخول إلى نظام الميديا',
      });
      return;
    }

    if (
      decoded.isReadOnly ||
      decoded.username === 'manager' ||
      decoded.username === 'مدير'
    ) {
      res.status(403).json({
        success: false,
        message: 'حسابك بصلاحية المشاهدة فقط',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'رمز الدخول غير صالح أو منتهي',
    });
  }
}
