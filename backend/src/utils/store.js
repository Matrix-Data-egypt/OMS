const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Default initial accounts for the 4 roles - using pre-computed stable hashes
const defaultUsers = [
  {
    id: 'user-admin',
    username: 'admin',
    passwordHash: '$2b$10$SbrchyaV9hLb1NUWuQuCRO2BoGmPKWHMpiIztKjqXmZTOWtB2x4nq',
    name: 'الادمن (Admin)',
    role: 'admin',
    description: 'صلاحيات كاملة لجميع الصفحات والمستخدمين',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-manager',
    username: 'manager',
    passwordHash: '$2b$10$0WySokgv/yHtgbUnC3tnq.yYcVlzkZSasRbdZ4wnGIqAqMbTBNjpG',
    name: 'مدير (Manager)',
    role: 'manager',
    description: 'مشاهدة فقط لجميع الصفحات بدون تعديل أو حذف',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-sales',
    username: 'sales',
    passwordHash: '$2b$10$YY5YrUycn1BbMuT5vQHbceDSiSsc2qohslXaUcAP0ewkl0uQJu3Am',
    name: 'تيم Sales (فريق المبيعات)',
    role: 'sales',
    description: 'دخول على Start Project فقط لمتابعة العملاء والتواصل',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-dataentry',
    username: 'dataentry',
    passwordHash: '$2b$10$tmyMBMQM6kGTtsBg97jkq.Arj0i4ZYzKM/X6fmo50.QTmnK7NB/li',
    name: 'مدخل بيانات (Data Entry)',
    role: 'data_entry',
    description: 'مفتوح له باقي الصفحات لإدخال البيانات ماعدا Start Project',
    createdAt: new Date().toISOString()
  }
];

const defaultDb = {
  briefs: [],
  blogPosts: [],
  videos: [],
  clients: [],
  outdoor: [],
  poss: [],
  users: defaultUsers,
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
  } else {
    // If db exists but users array is missing or empty, seed them
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
        parsed.users = defaultUsers;
        fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), { encoding: 'utf8' });
      }
    } catch (e) {
      console.error('Error verifying users in db.json:', e);
    }
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    briefs: [],
    blogPosts: [],
    videos: [],
    clients: [],
    outdoor: [],
    poss: [],
    users: defaultUsers,
    ...parsed,
  };
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), { encoding: 'utf8' });
}

function updateCollection(key, updater) {
  const db = readDb();
  db[key] = updater(db[key] || []);
  writeDb(db);
  return db[key];
}

module.exports = { readDb, writeDb, updateCollection, DATA_DIR, defaultUsers };
