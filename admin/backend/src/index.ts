import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;
const JWT_SECRET = process.env.JWT_SECRET || 'oms_admin_jwt_secret_secure_key_2026_mde';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Auth Middleware for Admin
interface AuthRequest extends Request {
  user?: any;
}

const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'مطلوب تسجيل الدخول كمسؤول' });
      return;
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      `SELECT id, name, email, username, role, "systemAccess", "isActive" FROM "public"."users" WHERE id = $1`,
      [decoded.id]
    );

    if (rows.length === 0 || !rows[0].isActive) {
      res.status(403).json({ success: false, message: 'الحساب غير مفعّل أو غير موجود' });
      return;
    }

    const user = rows[0];
    if (user.role !== 'ADMIN' && user.systemAccess !== 'ALL') {
      res.status(403).json({ success: false, message: 'ليس لديك صلاحية إدارة المستخدمين (Admin only)' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'جلسة الدخول غير صالحة أو منتهية' });
  }
};

// ----------------- ROUTES -----------------

// Admin Login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { loginIdentifier, password } = req.body;
    const identifier = (loginIdentifier || '').trim();

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور مطلوبان' });
      return;
    }

    const { rows } = await pool.query(
      `SELECT id, name, email, username, "passwordHash", role, "systemAccess", "isActive", phone
       FROM "public"."users"
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)
       LIMIT 1`,
      [identifier]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
      return;
    }

    const user = rows[0];

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'هذا الحساب غير مفعّل' });
      return;
    }

    // Only Admin or ALL access allowed in Admin Portal
    if (user.role !== 'ADMIN' && user.systemAccess !== 'ALL') {
      res.status(403).json({
        success: false,
        message: 'عفواً، هذه البوابة مخصصة للإدارة ومديري النظام فقط.',
      });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        systemAccess: user.systemAccess,
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
          phone: user.phone,
        },
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// Get current admin profile
app.get('/api/auth/me', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: req.user });
});

// List all users
app.get('/api/users', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, username, role, "systemAccess", phone, "isActive", "createdAt", "updatedAt"
       FROM "public"."users"
       ORDER BY "createdAt" DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('get users error:', error);
    res.status(500).json({ success: false, message: 'خطأ أثناء جلب المستخدمين' });
  }
});

// Create new user
const createUserSchema = z.object({
  name: z.string().min(2, 'الاسم الكامل مطلوب'),
  username: z.string().min(3, 'اسم المستخدم يجب ألا يقل عن 3 أحرف'),
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
  phone: z.string().optional(),
  role: z.string().default('ACCOUNTANT'),
  systemAccess: z.enum(['INVOICE', 'MEDIA', 'ALL']).default('INVOICE'),
});

app.post('/api/users', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.errors });
      return;
    }

    const { name, username, email, password, phone, role, systemAccess } = parsed.data;

    // Check unique email / username
    const existing = await pool.query(
      `SELECT id, email, username FROM "public"."users" WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)`,
      [email.trim(), username.trim()]
    );

    if (existing.rows.length > 0) {
      const match = existing.rows[0];
      if (match.email.toLowerCase() === email.trim().toLowerCase()) {
        res.status(400).json({ success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر' });
        return;
      }
      if (match.username && match.username.toLowerCase() === username.trim().toLowerCase()) {
        res.status(400).json({ success: false, message: 'اسم المستخدم هذا مستخدم بالفعل، اختر اسماً آخر' });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newId = crypto.randomUUID();

    const insertQuery = `
      INSERT INTO "public"."users" (
        "id", "name", "username", "email", "passwordHash", "phone", "role", "systemAccess", "isActive", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::"public"."UserRole", $8, true, NOW(), NOW())
      RETURNING id, name, username, email, phone, role, "systemAccess", "isActive", "createdAt"
    `;

    // Map role safely to PostgreSQL enum UserRole (ADMIN, FINANCE_MANAGER, ACCOUNTANT, SALES)
    let validRole = 'ACCOUNTANT';
    if (['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'SALES'].includes(role)) {
      validRole = role;
    }

    const { rows } = await pool.query(insertQuery, [
      newId,
      name.trim(),
      username.trim(),
      email.trim(),
      passwordHash,
      phone?.trim() || null,
      validRole,
      systemAccess,
    ]);

    res.status(201).json({
      success: true,
      data: rows[0],
      message: `تم إنشاء المستخدم (${name.trim()}) بنجاح وتحديد اختصاصه على [${systemAccess === 'MEDIA' ? 'قسم الميديا فقط' : systemAccess === 'INVOICE' ? 'قسم الفواتير فقط' : 'كافة الأنظمة'}]`,
    });
  } catch (error: any) {
    console.error('create user error:', error);
    res.status(500).json({ success: false, message: 'خطأ أثناء إنشاء المستخدم: ' + error.message });
  }
});

// Update user details & system access
app.put('/api/users/:id', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, username, email, phone, role, systemAccess, isActive } = req.body;

    // Check unique conflict for email or username
    if (email || username) {
      const conflict = await pool.query(
        `SELECT id FROM "public"."users" WHERE (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)) AND id != $3`,
        [email?.trim() || '', username?.trim() || '', id]
      );
      if (conflict.rows.length > 0) {
        res.status(400).json({ success: false, message: 'البريد أو اسم المستخدم مستخدم من قبل حساب آخر' });
        return;
      }
    }

    let validRole = 'ACCOUNTANT';
    if (['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'SALES'].includes(role)) {
      validRole = role;
    }

    const updateQuery = `
      UPDATE "public"."users" SET
        "name" = COALESCE($1, "name"),
        "username" = COALESCE($2, "username"),
        "email" = COALESCE($3, "email"),
        "phone" = COALESCE($4, "phone"),
        "role" = COALESCE($5::"public"."UserRole", "role"),
        "systemAccess" = COALESCE($6, "systemAccess"),
        "isActive" = COALESCE($7, "isActive"),
        "updatedAt" = NOW()
      WHERE id = $8
      RETURNING id, name, username, email, phone, role, "systemAccess", "isActive", "updatedAt"
    `;

    const { rows } = await pool.query(updateQuery, [
      name?.trim() || null,
      username?.trim() || null,
      email?.trim() || null,
      phone?.trim() || null,
      validRole,
      systemAccess || null,
      typeof isActive === 'boolean' ? isActive : null,
      id,
    ]);

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
      return;
    }

    res.json({
      success: true,
      data: rows[0],
      message: 'تم تحديث بيانات المستخدم وصلاحيات الوصول بنجاح',
    });
  } catch (error: any) {
    console.error('update user error:', error);
    res.status(500).json({ success: false, message: 'خطأ أثناء تحديث المستخدم: ' + error.message });
  }
});

// Reset user password
app.put('/api/users/:id/reset-password', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' });
      return;
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const { rows } = await pool.query(
      `UPDATE "public"."users" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, name`,
      [hash, id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
      return;
    }

    res.json({
      success: true,
      message: `تم تغيير كلمة المرور للمستخدم (${rows[0].name}) بنجاح`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ أثناء تغيير كلمة المرور' });
  }
});

// Delete user
app.delete('/api/users/:id', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user && req.user.id === id) {
      res.status(400).json({ success: false, message: 'لا يمكنك حذف حسابك الشخصي الحالي' });
      return;
    }

    await pool.query(`DELETE FROM "public"."users" WHERE id = $1`, [id]);
    res.json({ success: true, message: 'تم حذف المستخدم نهائياً بنجاح' });
  } catch (error: any) {
    console.error('delete user error:', error);
    res.status(500).json({ success: false, message: 'لا يمكن حذف المستخدم لوجود سجلات مالية أو فواتير مرتبطة به. يمكنك تعطيل الحساب بدلاً من ذلك.' });
  }
});

// System statistics
app.get('/api/stats', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsersRes = await pool.query(`SELECT COUNT(*)::int as count FROM "public"."users"`);
    const activeUsersRes = await pool.query(`SELECT COUNT(*)::int as count FROM "public"."users" WHERE "isActive" = true`);
    const invoiceUsersRes = await pool.query(`SELECT COUNT(*)::int as count FROM "public"."users" WHERE "systemAccess" = 'INVOICE'`);
    const mediaUsersRes = await pool.query(`SELECT COUNT(*)::int as count FROM "public"."users" WHERE "systemAccess" = 'MEDIA'`);
    const allUsersRes = await pool.query(`SELECT COUNT(*)::int as count FROM "public"."users" WHERE "systemAccess" = 'ALL'`);

    res.json({
      success: true,
      data: {
        total: totalUsersRes.rows[0]?.count || 0,
        active: activeUsersRes.rows[0]?.count || 0,
        invoiceUsers: invoiceUsersRes.rows[0]?.count || 0,
        mediaUsers: mediaUsersRes.rows[0]?.count || 0,
        allAccessUsers: allUsersRes.rows[0]?.count || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب إحصائيات النظام' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'OMS Admin Management API',
    company: 'OMS',
    developer: 'MDE – Matrix Data Egypt',
    port: PORT,
  });
});

app.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`🛡️ OMS Admin Management API running on http://127.0.0.1:${PORT}`);
});
