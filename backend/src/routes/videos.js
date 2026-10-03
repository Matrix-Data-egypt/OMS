const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { readDb, updateCollection } = require('../utils/store');
const { requireAdmin } = require('../middleware/auth');
const { toYouTubeEmbed, isYouTubeUrl } = require('../utils/youtube');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^video\//.test(file.mimetype) || /^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only video or image files are allowed'));
  },
});

// Public: all videos for Production TV
router.get('/', (_req, res) => {
  const { videos } = readDb();
  const sorted = [...videos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  res.json(sorted);
});

// Admin create — youtube link OR uploaded video file
router.post('/', requireAdmin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]), (req, res) => {
  try {
    const { brand, title, desc, youtubeUrl, type } = req.body || {};
    if (!brand?.trim() || !title?.trim()) {
      return res.status(400).json({ message: 'Brand and title are required' });
    }

    const videoFile = req.files?.video?.[0];
    const thumbFile = req.files?.thumbnail?.[0];
    let videoType = type || 'youtube';
    let embedUrl = '';
    let fileUrl = '';

    if (youtubeUrl && isYouTubeUrl(youtubeUrl)) {
      videoType = 'youtube';
      embedUrl = toYouTubeEmbed(youtubeUrl);
      if (!embedUrl) {
        return res.status(400).json({ message: 'Invalid YouTube URL' });
      }
    } else if (videoFile) {
      videoType = 'file';
      fileUrl = `/uploads/videos/${videoFile.filename}`;
    } else {
      return res.status(400).json({ message: 'Provide a YouTube URL or upload a video file' });
    }

    const { videos } = readDb();
    const item = {
      id: uuidv4(),
      brand: brand.trim(),
      title: title.trim(),
      desc: (desc || '').trim(),
      type: videoType,
      embedUrl,
      fileUrl,
      youtubeUrl: youtubeUrl || '',
      thumbnail: thumbFile
        ? `/uploads/videos/${thumbFile.filename}`
        : req.body.thumbnailUrl || '',
      featured: req.body.featured === 'true' || req.body.featured === true,
      order: videos.length,
      createdAt: new Date().toISOString(),
    };

    updateCollection('videos', (list) => [...list, item]);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create video' });
  }
});

router.put('/:id', requireAdmin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]), (req, res) => {
  let updated = null;
  const videoFile = req.files?.video?.[0];
  const thumbFile = req.files?.thumbnail?.[0];

  updateCollection('videos', (list) =>
    list.map((v) => {
      if (v.id !== req.params.id) return v;

      let embedUrl = v.embedUrl;
      let fileUrl = v.fileUrl;
      let videoType = v.type;
      let youtubeUrl = v.youtubeUrl;

      if (req.body.youtubeUrl && isYouTubeUrl(req.body.youtubeUrl)) {
        videoType = 'youtube';
        youtubeUrl = req.body.youtubeUrl;
        embedUrl = toYouTubeEmbed(req.body.youtubeUrl);
        fileUrl = '';
      } else if (videoFile) {
        videoType = 'file';
        fileUrl = `/uploads/videos/${videoFile.filename}`;
        embedUrl = '';
        youtubeUrl = '';
      }

      updated = {
        ...v,
        brand: req.body.brand?.trim() || v.brand,
        title: req.body.title?.trim() || v.title,
        desc: req.body.desc !== undefined ? req.body.desc.trim() : v.desc,
        type: videoType,
        embedUrl,
        fileUrl,
        youtubeUrl,
        thumbnail: thumbFile
          ? `/uploads/videos/${thumbFile.filename}`
          : req.body.thumbnailUrl !== undefined
            ? req.body.thumbnailUrl
            : v.thumbnail,
        featured:
          req.body.featured === undefined
            ? v.featured
            : req.body.featured === 'true' || req.body.featured === true,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    })
  );

  if (!updated) return res.status(404).json({ message: 'Video not found' });
  res.json(updated);
});

router.delete('/:id', requireAdmin, (req, res) => {
  let found = false;
  updateCollection('videos', (list) =>
    list.filter((v) => {
      if (v.id === req.params.id) {
        found = true;
        return false;
      }
      return true;
    })
  );
  if (!found) return res.status(404).json({ message: 'Video not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
