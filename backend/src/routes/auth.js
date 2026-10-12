const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { jwtSecret, adminUsername, adminPassword } = require('../config');
const { readDb, updateCollection } = require('../utils/store');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Role definitions and permission descriptions
const ROLE_DETAILS = {
  admin: {
    title: 'الادمن (Admin)',
    description: 'كافة الصلاحيات (قراءة، إضافة، تعديل، حذف، وإدارة المستخدمين)',
    canAccessBriefs: true,
    canAccessContent: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true
  },
  manager: {
    title: 'مدير (Manager)',
    description: 'مشاهدة فقط لجميع الصفحات لمعرفة ما بداخلها بدون تعديل أو حذف',
    canAccessBriefs: true,
    canAccessContent: true,
    canWrite: false,
    canDelete: false,
    canManageUsers: false
  },
  sales: {
    title: 'تيم Sales (فريق المبيعات)',
    description: 'دخول فقط على Start Project لمتابعة العملاء والتواصل وتحديث الحالة',
    canAccessBriefs: true,
    canAccessContent: false,
    canWrite: true,
    canDelete: false,
    canManageUsers: false
  },
  data_entry: {
    title: 'مدخل بيانات (Data Entry)',
    description: 'مفتوح له باقي الصفحات لإدخال وتعديل البيانات ماعدا Start Project',
    canAccessBriefs: false,
    canAccessContent: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: false
  }
};

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  const { users = [] } = readDb();
  const trimmedUser = String(username).trim();

  // Find user by username
  let targetUser = users.find(
    (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
  );

  // Fallback check against config admin credentials if not found in db
  if (!targetUser && trimmedUser === adminUsername && password === adminPassword) {
    targetUser = {
      id: 'user-admin',
      username: adminUsername,
      name: 'الادمن (Admin)',
      role: 'admin'
    };
  } else if (targetUser) {
    const isMatch = bcrypt.compareSync(password, targetUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } else {
    return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const roleInfo = ROLE_DETAILS[targetUser.role] || ROLE_DETAILS.admin;

  const tokenPayload = {
    id: targetUser.id,
    username: targetUser.username,
    name: targetUser.name || targetUser.username,
    role: targetUser.role
  };

  const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      ...tokenPayload,
      roleDetails: roleInfo
    }
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const roleInfo = ROLE_DETAILS[req.user.role] || ROLE_DETAILS.admin;
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      name: req.user.name,
      role: req.user.role,
      roleDetails: roleInfo
    }
  });
});

router.get('/roles', (_req, res) => {
  res.json(ROLE_DETAILS);
});

// Admin: List all users
router.get('/users', requireAdmin, (_req, res) => {
  const { users = [] } = readDb();
  const sanitized = users.map(({ passwordHash, ...rest }) => ({
    ...rest,
    roleDetails: ROLE_DETAILS[rest.role] || {}
  }));
  res.json(sanitized);
});

// Admin: Add a new user with a specific role
router.post('/users', requireAdmin, (req, res) => {
  const { username, password, name, role } = req.body || {};

  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  const allowedRoles = ['admin', 'manager', 'sales', 'data_entry'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'نوع الصلاحية غير صالح' });
  }

  const { users = [] } = readDb();
  if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return res.status(400).json({ message: 'اسم المستخدم مسجل بالفعل' });
  }

  const newUser = {
    id: uuidv4(),
    username: username.trim(),
    name: name?.trim() || username.trim(),
    role,
    passwordHash: bcrypt.hashSync(password.trim(), 10),
    createdAt: new Date().toISOString()
  };

  updateCollection('users', (list) => [...list, newUser]);

  const { passwordHash, ...safeUser } = newUser;
  res.status(201).json({
    message: 'تم إضافة المستخدم بنجاح',
    user: safeUser
  });
});

module.exports = router;
