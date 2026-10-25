const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { jwtSecret } = require('../config');
const { readDb, updateCollection } = require('../utils/store');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────
// POST /api/customers/register  — تسجيل عميل جديد
// ─────────────────────────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { fullName, email, password, gender, phone } = req.body || {};

  // Validate required fields
  if (!fullName?.trim()) {
    return res.status(400).json({ message: 'الاسم الكامل مطلوب' });
  }
  if (!email?.trim()) {
    return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
  }
  if (!password?.trim() || password.length < 6) {
    return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'البريد الإلكتروني غير صالح' });
  }

  const { customers = [] } = readDb();
  const normalizedEmail = email.trim().toLowerCase();

  // Check for duplicate
  if (customers.some((c) => c.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: 'هذا البريد الإلكتروني مسجل بالفعل. جرب تسجيل الدخول.' });
  }

  const newCustomer = {
    id: uuidv4(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    gender: gender || null,
    phone: phone?.trim() || null,
    passwordHash: bcrypt.hashSync(password.trim(), 10),
    role: 'customer',
    registeredAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  updateCollection('customers', (list) => [...list, newCustomer]);

  const { passwordHash, ...safeCustomer } = newCustomer;

  const token = jwt.sign(
    { id: safeCustomer.id, email: safeCustomer.email, name: safeCustomer.fullName, role: 'customer' },
    jwtSecret,
    { expiresIn: '30d' }
  );

  res.status(201).json({
    message: `أهلاً بك يا ${safeCustomer.fullName}! تم إنشاء حسابك بنجاح.`,
    token,
    customer: safeCustomer,
  });
});

// ─────────────────────────────────────────────────────────────────────
// POST /api/customers/login  — تسجيل دخول عميل
// ─────────────────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  const { customers = [] } = readDb();
  const normalizedEmail = email.trim().toLowerCase();
  const customer = customers.find((c) => c.email.toLowerCase() === normalizedEmail);

  if (!customer) {
    return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  const isMatch = bcrypt.compareSync(password.trim(), customer.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  // Update lastLoginAt
  updateCollection('customers', (list) =>
    list.map((c) =>
      c.id === customer.id ? { ...c, lastLoginAt: new Date().toISOString() } : c
    )
  );

  const token = jwt.sign(
    { id: customer.id, email: customer.email, name: customer.fullName, role: 'customer' },
    jwtSecret,
    { expiresIn: '30d' }
  );

  const { passwordHash, ...safeCustomer } = customer;
  res.json({
    message: `مرحباً بك مجدداً يا ${safeCustomer.fullName}!`,
    token,
    customer: { ...safeCustomer, lastLoginAt: new Date().toISOString() },
  });
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/customers  — قائمة العملاء (للأدمن فقط)
// ─────────────────────────────────────────────────────────────────────
router.get('/', requireAdmin, (_req, res) => {
  const { customers = [] } = readDb();
  const sanitized = customers.map(({ passwordHash, ...rest }) => rest);
  res.json(sanitized);
});

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/customers/:id  — حذف عميل (للأدمن فقط)
// ─────────────────────────────────────────────────────────────────────
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { customers = [] } = readDb();
  const exists = customers.find((c) => c.id === id);
  if (!exists) {
    return res.status(404).json({ message: 'العميل غير موجود' });
  }
  updateCollection('customers', (list) => list.filter((c) => c.id !== id));
  res.json({ message: 'تم حذف العميل بنجاح' });
});

module.exports = router;
