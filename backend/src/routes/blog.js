const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { readDb, updateCollection } = require('../utils/store');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads/blog');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

function estimateReadTime(content) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDisplayDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Public list (published only)
router.get('/', (_req, res) => {
  const { blogPosts } = readDb();
  const published = blogPosts
    .filter((p) => p.published !== false)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(published);
});

// Admin: all posts including drafts (must be before /:id)
router.get('/admin/all', requireAdmin, (_req, res) => {
  const { blogPosts } = readDb();
  res.json([...blogPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.get('/:id', (req, res) => {
  const { blogPosts } = readDb();
  const post = blogPosts.find((p) => p.id === req.params.id);
  if (!post || post.published === false) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json(post);
});

router.post('/', requireAdmin, upload.single('image'), (req, res) => {
  try {
    const { title, author, desc, content, published } = req.body || {};
    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

    const now = new Date().toISOString();
    const post = {
      id: uuidv4(),
      title: title.trim(),
      author: (author || 'OMS Editorial').trim(),
      desc: (desc || content.slice(0, 160)).trim(),
      content: content.trim(),
      readTime: estimateReadTime(content),
      date: formatDisplayDate(now),
      img: req.file ? `/uploads/blog/${req.file.filename}` : (req.body.imgUrl || ''),
      published: published === 'false' || published === false ? false : true,
      createdAt: now,
      updatedAt: now,
    };

    updateCollection('blogPosts', (list) => [post, ...list]);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create post' });
  }
});

router.put('/:id', requireAdmin, upload.single('image'), (req, res) => {
  let updated = null;
  updateCollection('blogPosts', (list) =>
    list.map((p) => {
      if (p.id !== req.params.id) return p;
      const content = req.body.content !== undefined ? req.body.content : p.content;
      updated = {
        ...p,
        title: req.body.title?.trim() || p.title,
        author: req.body.author?.trim() || p.author,
        desc: req.body.desc?.trim() || p.desc,
        content: content?.trim?.() || content || p.content,
        readTime: estimateReadTime(content),
        img: req.file
          ? `/uploads/blog/${req.file.filename}`
          : req.body.imgUrl !== undefined
            ? req.body.imgUrl
            : p.img,
        published:
          req.body.published === undefined
            ? p.published
            : !(req.body.published === 'false' || req.body.published === false),
        updatedAt: new Date().toISOString(),
      };
      return updated;
    })
  );

  if (!updated) return res.status(404).json({ message: 'Post not found' });
  res.json(updated);
});

router.delete('/:id', requireAdmin, (req, res) => {
  let found = false;
  updateCollection('blogPosts', (list) =>
    list.filter((p) => {
      if (p.id === req.params.id) {
        found = true;
        return false;
      }
      return true;
    })
  );
  if (!found) return res.status(404).json({ message: 'Post not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
