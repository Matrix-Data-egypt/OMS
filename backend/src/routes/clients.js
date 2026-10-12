const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { readDb, updateCollection } = require('../utils/store');
const { requireAdmin, requireContentAccess, requireWriteAccess } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads/clients');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed for logos'));
  },
});

// Public list
router.get('/', (_req, res) => {
  const { clients } = readDb();
  const list = [...(clients || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  res.json(list);
});

router.post('/', requireContentAccess, requireWriteAccess, upload.single('logo'), (req, res) => {
  try {
    const { name, website } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const logoUrl = req.file
      ? `/uploads/clients/${req.file.filename}`
      : (req.body.logoUrl || '').trim();

    if (!logoUrl) {
      return res.status(400).json({ message: 'Upload a logo image or provide logoUrl' });
    }

    const { clients } = readDb();
    const item = {
      id: uuidv4(),
      name: name.trim(),
      logo: logoUrl,
      website: (website || '').trim(),
      order: (clients || []).length,
      createdAt: new Date().toISOString(),
    };

    updateCollection('clients', (list) => [...list, item]);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to add client' });
  }
});

router.put('/:id', requireContentAccess, requireWriteAccess, upload.single('logo'), (req, res) => {
  let updated = null;
  updateCollection('clients', (list) =>
    list.map((c) => {
      if (c.id !== req.params.id) return c;
      updated = {
        ...c,
        name: req.body.name?.trim() || c.name,
        website: req.body.website !== undefined ? req.body.website.trim() : c.website,
        logo: req.file
          ? `/uploads/clients/${req.file.filename}`
          : req.body.logoUrl !== undefined
            ? req.body.logoUrl
            : c.logo,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    })
  );
  if (!updated) return res.status(404).json({ message: 'Client not found' });
  res.json(updated);
});

router.delete('/:id', requireContentAccess, requireWriteAccess, (req, res) => {
  let found = false;
  updateCollection('clients', (list) =>
    list.filter((c) => {
      if (c.id === req.params.id) {
        found = true;
        return false;
      }
      return true;
    })
  );
  if (!found) return res.status(404).json({ message: 'Client not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
