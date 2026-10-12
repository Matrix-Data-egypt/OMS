const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const defaultDb = {
  briefs: [],
  blogPosts: [],
  videos: [],
  clients: [],
  outdoor: [],
  poss: [],
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
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

module.exports = { readDb, writeDb, updateCollection, DATA_DIR };
