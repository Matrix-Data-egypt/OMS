
import express, {
  Request,
  Response,
  NextFunction
} from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { pool } from './db.js';

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5003;

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from environment variables');
}

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: [
      'https://oms-admin-frontend.vercel.app',
      'https://oms-tur2.vercel.app',
      'https://oms-invoice-client-lyart.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ],
    credentials: true
  })
);

app.use(express.json());

// ==========================================
// AUTH TYPES
// ==========================================

interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    systemAccess: string;
    isActive?: boolean;
  };
}

// ==========================================
// ADMIN AUTH MIDDLEWARE
// ==========================================

const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'مطلوب تسجيل الدخول كمسؤول'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
    };

    const { rows } = await pool.query(
      `SELECT
         id,
         name,
         email,
         username,
         role,
         "systemAccess",
         "isActive"
       FROM "public"."users"
       WHERE id = $1`,
      [decoded.id]
    );

    if (rows.length === 0 || !rows[0].isActive) {
      res.status(403).json({
        success: false,
        message: 'الحساب غير مفعّل أو غير موجود'
      });
      return;
    }

    const user = rows[0];

    if (
      user.role !== 'ADMIN' &&
      user.systemAccess !== 'ALL'
    ) {
      res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية إدارة المستخدمين'
      });
      return;
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'جلسة الدخول غير صالحة أو منتهية'
    });
  }
};

// ==========================================
// ROOT
// ==========================================

app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'OMS Admin Hub',
    health: '/api/health'
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'OMS Admin Hub',
    developer: 'MDE – Matrix Data Egypt',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// ADMIN LOGIN
// ==========================================

app.post(
  '/api/auth/login',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { loginIdentifier, password } = req.body;

      const identifier =
        typeof loginIdentifier === 'string'
          ? loginIdentifier.trim()
          : '';

      if (!identifier || !password) {
        res.status(400).json({
          success: false,
          message: 'اسم المستخدم وكلمة المرور مطلوبان'
        });
        return;
      }

      const { rows } = await pool.query(
        `SELECT
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
         WHERE LOWER(email) = LOWER($1)
            OR LOWER(username) = LOWER($1)
         LIMIT 1`,
        [identifier]
      );

      if (rows.length === 0) {
        res.status(401).json({
          success: false,
          message: 'بيانات الدخول غير صحيحة'
        });
        return;
      }

      const user = rows[0];

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          message: 'هذا الحساب غير مفعّل'
        });
        return;
      }

      if (
        user.role !== 'ADMIN' &&
        user.systemAccess !== 'ALL'
      ) {
        res.status(403).json({
          success: false,
          message: 'هذه البوابة مخصصة للإدارة ومديري النظام فقط'
        });
        return;
      }

      const match = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!match) {
        res.status(401).json({
          success: false,
          message: 'بيانات الدخول غير صحيحة'
        });
        return;
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          systemAccess: user.systemAccess
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح إلى لوحة الإدارة',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            systemAccess: user.systemAccess,
            phone: user.phone
          }
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);

      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تسجيل الدخول'
      });
    }
  }
);

// ==========================================
// CURRENT ADMIN PROFILE
// ==========================================

app.get(
  '/api/auth/me',
  requireAdmin,
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      data: req.user
    });
  }
);

// ==========================================
// GET ALL USERS
// ==========================================

app.get(
  '/api/users',
  requireAdmin,
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { rows } = await pool.query(
        `SELECT
           id,
           name,
           email,
           username,
           role,
           "systemAccess",
           phone,
           "isActive",
           "createdAt",
           "updatedAt"
         FROM "public"."users"
         ORDER BY "createdAt" DESC`
      );

      res.json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error('Get users error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء جلب المستخدمين'
      });
    }
  }
);

// ==========================================
// SYSTEM STATISTICS
// ==========================================

app.get(
  '/api/stats',
  requireAdmin,
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { rows } = await pool.query(`
        SELECT
          COUNT(*)::int AS total,

          COUNT(*) FILTER (
            WHERE "isActive" = true
          )::int AS active,

          COUNT(*) FILTER (
            WHERE "systemAccess" = 'INVOICE'
          )::int AS "invoiceUsers",

          COUNT(*) FILTER (
            WHERE "systemAccess" = 'MEDIA'
          )::int AS "mediaUsers",

          COUNT(*) FILTER (
            WHERE "systemAccess" = 'ALL'
          )::int AS "allAccessUsers"

        FROM "public"."users"
      `);

      res.json({
        success: true,
        data: rows[0]
      });

    } catch (error) {
      console.error('Get stats error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء جلب إحصائيات النظام'
      });
    }
  }
);

// ==========================================
// CREATE USER
// ==========================================

const createUserSchema = z.object({
  name: z.string().min(2, 'الاسم الكامل مطلوب'),
  username: z.string().min(3, 'اسم المستخدم يجب ألا يقل عن 3 أحرف'),
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
  phone: z.string().optional(),
  role: z.string().default('ACCOUNTANT'),
  systemAccess: z.enum(['INVOICE', 'MEDIA', 'ALL']).default('INVOICE')
});

app.post(
  '/api/users',
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parsed = createUserSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          errors: parsed.error.errors
        });
        return;
      }

      const {
        name,
        username,
        email,
        password,
        phone,
        role,
        systemAccess
      } = parsed.data;

      const existing = await pool.query(
        `SELECT id, email, username
         FROM "public"."users"
         WHERE LOWER(email) = LOWER($1)
            OR LOWER(username) = LOWER($2)`,
        [email.trim(), username.trim()]
      );

      if (existing.rows.length > 0) {
        const emailTaken = existing.rows.some(
          (user: { email: string }) =>
            user.email?.toLowerCase() === email.trim().toLowerCase()
        );

        res.status(400).json({
          success: false,
          message: emailTaken
            ? 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر'
            : 'اسم المستخدم هذا مستخدم بالفعل، اختر اسماً آخر'
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newId = crypto.randomUUID();

      const validRoles = [
        'ADMIN',
        'FINANCE_MANAGER',
        'ACCOUNTANT',
        'SALES'
      ];

      const validRole = validRoles.includes(role)
        ? role
        : 'ACCOUNTANT';

      const { rows } = await pool.query(
        `INSERT INTO "public"."users" (
           "id",
           "name",
           "username",
           "email",
           "passwordHash",
           "phone",
           "role",
           "systemAccess",
           "isActive",
           "createdAt",
           "updatedAt"
         )
         VALUES (
           $1, $2, $3, $4, $5, $6,
           $7::"public"."UserRole",
           $8, true, NOW(), NOW()
         )
         RETURNING
           id,
           name,
           username,
           email,
           phone,
           role,
           "systemAccess",
           "isActive",
           "createdAt"`,
        [
          newId,
          name.trim(),
          username.trim(),
          email.trim(),
          passwordHash,
          phone?.trim() || null,
          validRole,
          systemAccess
        ]
      );

      res.status(201).json({
        success: true,
        data: rows[0],
        message: `تم إنشاء المستخدم (${name.trim()}) بنجاح`
      });

    } catch (error: any) {
      console.error('Create user error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء إنشاء المستخدم: ' + error.message
      });
    }
  }
);

// ==========================================
// UPDATE USER DETAILS
// ==========================================

app.put(
  '/api/users/:id',
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const {
        name,
        username,
        email,
        phone,
        role,
        systemAccess,
        isActive
      } = req.body;

      if (email || username) {
        const conflict = await pool.query(
          `SELECT id
           FROM "public"."users"
           WHERE (
             LOWER(email) = LOWER($1)
             OR LOWER(username) = LOWER($2)
           )
           AND id != $3`,
          [
            email?.trim() || '',
            username?.trim() || '',
            id
          ]
        );

        if (conflict.rows.length > 0) {
          res.status(400).json({
            success: false,
            message: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل'
          });
          return;
        }
      }

      const validRoles = [
        'ADMIN',
        'FINANCE_MANAGER',
        'ACCOUNTANT',
        'SALES'
      ];

      const validRole =
        role && validRoles.includes(role)
          ? role
          : null;

      const { rows } = await pool.query(
        `UPDATE "public"."users"
         SET
           name = COALESCE($1, name),
           username = COALESCE($2, username),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           role = COALESCE($5::"public"."UserRole", role),
           "systemAccess" = COALESCE($6, "systemAccess"),
           "isActive" = COALESCE($7, "isActive"),
           "updatedAt" = NOW()
         WHERE id = $8
         RETURNING
           id,
           name,
           username,
           email,
           phone,
           role,
           "systemAccess",
           "isActive",
           "updatedAt"`,
        [
          name?.trim() || null,
          username?.trim() || null,
          email?.trim() || null,
          phone !== undefined ? phone?.trim() || null : null,
          validRole,
          systemAccess || null,
          isActive !== undefined ? isActive : null,
          id
        ]
      );

      if (rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
        return;
      }

      res.json({
        success: true,
        data: rows[0],
        message: 'تم تحديث بيانات وصلاحيات المستخدم بنجاح'
      });

    } catch (error: any) {
      console.error('Update user error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء تحديث المستخدم: ' + error.message
      });
    }
  }
);

// ==========================================
// TOGGLE USER STATUS
// ==========================================

app.patch(
  '/api/users/:id/toggle-status',
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (req.user?.id === id) {
        res.status(400).json({
          success: false,
          message: 'لا يمكنك تعطيل حسابك الشخصي'
        });
        return;
      }

      const { rows } = await pool.query(
        `UPDATE "public"."users"
         SET
           "isActive" = NOT "isActive",
           "updatedAt" = NOW()
         WHERE id = $1
         RETURNING id, name, "isActive"`,
        [id]
      );

      if (rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
        return;
      }

      res.json({
        success: true,
        data: rows[0],
        message: rows[0].isActive
          ? `تم تفعيل حساب (${rows[0].name})`
          : `تم تعطيل حساب (${rows[0].name})`
      });

    } catch (error) {
      console.error('Toggle status error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء تغيير حالة الحساب'
      });
    }
  }
);

// ==========================================
// RESET USER PASSWORD
// Supports both endpoints
// ==========================================

app.put(
  [
    '/api/users/:id/password',
    '/api/users/:id/reset-password'
  ],
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (
        typeof newPassword !== 'string' ||
        newPassword.trim().length < 6
      ) {
        res.status(400).json({
          success: false,
          message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف'
        });
        return;
      }

      if (req.user?.id === id) {
        res.status(400).json({
          success: false,
          message: 'لا يمكنك تغيير كلمة مرور حسابك من هذه العملية'
        });
        return;
      }

      const existingUser = await pool.query(
        `SELECT id, name
         FROM "public"."users"
         WHERE id = $1
         LIMIT 1`,
        [id]
      );

      if (existingUser.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
        return;
      }

      const passwordHash = await bcrypt.hash(
        newPassword,
        10
      );

      const result = await pool.query(
        `UPDATE "public"."users"
         SET
           "passwordHash" = $1,
           "updatedAt" = NOW()
         WHERE id = $2
         RETURNING id, name`,
        [passwordHash, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'تعذر العثور على المستخدم'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `تم تغيير كلمة مرور (${result.rows[0].name}) بنجاح`
      });

    } catch (error) {
      console.error('Reset password error:', error);

      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
      });
    }
  }
);

// ==========================================
// DELETE USER
// ==========================================

app.delete(
  '/api/users/:id',
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (req.user?.id === id) {
        res.status(400).json({
          success: false,
          message: 'لا يمكنك حذف حسابك الشخصي أثناء تسجيل الدخول'
        });
        return;
      }

      const { rows } = await pool.query(
        `DELETE FROM "public"."users"
         WHERE id = $1
         RETURNING id, name`,
        [id]
      );

      if (rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
        return;
      }

      res.json({
        success: true,
        message: `تم حذف المستخدم (${rows[0].name}) بنجاح`
      });

    } catch (error: any) {
      console.error('Delete user error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء حذف المستخدم: ' + error.message
      });
    }
  }
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method
    });
  }
);

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error('Global API error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
);

// ==========================================
// SERVER START
// ==========================================

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OMS Admin Hub API running on port ${PORT}`);
    console.log('Developed by MDE – Matrix Data Egypt');
  });
}

export default app;
