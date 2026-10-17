const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { readDb, updateCollection } = require('../utils/store');
const { requireAdmin, requireContentAccess, requireWriteAccess } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads/poss');
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
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Public list
router.get('/', (_req, res) => {
  const { poss } = readDb();
  const list = [...(poss || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  res.json(list);
});

// Get single
router.get('/:id', (req, res) => {
  const { poss } = readDb();
  const item = (poss || []).find((x) => x.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'POSS item not found' });
  res.json(item);
});

// Create - Allowed for Admin and Data Entry
router.post('/', requireContentAccess, requireWriteAccess, upload.single('image'), (req, res) => {
  try {
    const { companyName, description } = req.body || {};
    const imageUrl = req.file
      ? `/uploads/poss/${req.file.filename}`
      : (req.body.imageUrl || '').trim();

    if (!imageUrl) {
      return res.status(400).json({ message: 'Upload an image or provide imageUrl' });
    }

    const { poss } = readDb();
    const item = {
      id: uuidv4(),
      companyName: (companyName || '').trim(),
      description: (description || '').trim(),
      image: imageUrl,
      order: (poss || []).length,
      createdAt: new Date().toISOString(),
    };

    updateCollection('poss', (list) => [...list, item]);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to add POSS item' });
  }
});

// Update - Allowed for Admin and Data Entry
router.put('/:id', requireContentAccess, requireWriteAccess, upload.single('image'), (req, res) => {
  let updated = null;
  updateCollection('poss', (list) =>
    list.map((c) => {
      if (c.id !== req.params.id) return c;
      updated = {
        ...c,
        companyName:
          req.body.companyName !== undefined ? req.body.companyName.trim() : c.companyName,
        description:
          req.body.description !== undefined ? req.body.description.trim() : c.description,
        image: req.file
          ? `/uploads/poss/${req.file.filename}`
          : req.body.imageUrl !== undefined
            ? req.body.imageUrl
            : c.image,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    })
  );
  if (!updated) return res.status(404).json({ message: 'POSS item not found' });
  res.json(updated);
});

// Delete - Allowed for Admin and Data Entry
router.delete('/:id', requireContentAccess, requireWriteAccess, (req, res) => {
  let found = false;
  updateCollection('poss', (list) =>
    list.filter((c) => {
      if (c.id === req.params.id) {
        found = true;
        return false;
      }
      return true;
    })
  );
  if (!found) return res.status(404).json({ message: 'POSS item not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
