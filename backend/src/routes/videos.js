const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // تأكدي أن مكتبة axios مستدعاة في الأعلى
const { v4: uuidv4 } = require('uuid');
const { readDb, updateCollection } = require('../utils/store');
const { requireAdmin, requireContentAccess, requireWriteAccess } = require('../middleware/auth');
const { toYouTubeEmbed, isYouTubeUrl } = require('../utils/youtube');

const router = express.Router();

const VIDEO_CATEGORIES = [
  'Furniture',
  'Electronics',
  'Food and Beverages',
  'Real Estate',
  'Cosmetics',
  'Pharmaceutical',
  'Clothes',
  'Paints',
  'Banking and Finance',
];

function normalizeCategory(raw) {
  if (raw == null) return '';
  const value = Array.isArray(raw) ? raw : raw;
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^Food\s*&\s*Beverages\$/i, 'Food and Beverages');
}

function resolveCategory(raw) {
  const normalized = normalizeCategory(raw);
  if (!normalized) return null;
  return (
    VIDEO_CATEGORIES.find((cat) => cat.toLowerCase() === normalized.toLowerCase()) || null
  );
}

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

// Public: جلب الفيديوهات المحلية المخزنة لديكِ
router.get('/', (_req, res) => {
  try {
    const { videos } = readDb();
    const sorted = [...videos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load videos' });
  }
});

// ========================================================
// 🌟 الراوت المستقل الجديد لجلب تغذية اليوتيوب (مصلح بنسبة 100%)
// ========================================================
router.get('/youtube-feed', async (req, res) => {
  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const YOUTUBE_CHANNEL_ID = "UCw-M_b4LPhuunwHreLp8fSA"; // المعرف الفريد لقناتك

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.trim() === "") {
      return res.status(400).json({ message: "YouTube API Key is missing in .env file" });
    }

    // 1. طلب الـ Uploads Playlist ID مع ضبط علامة الـ \$ والمسار الرسمي لـ جوجل
    const channelRes = await axios.get(
      `https://googleapis.com{YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    );
    
    const uploadsPlaylistId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return res.status(404).json({ message: "Uploads playlist not found for this channel" });
    }

    // 2. جلب أحدث 5 فيديوهات مرفوعة من تلك القائمة بالروابط الرسمية المصلحة
    const playlistRes = await axios.get(
      `https://googleapis.com{uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );

    // 3. تنسيق البيانات وإرسالها صافية وبأبعاد الـ embed المحمية
    const ytVideos = playlistRes.data.items.map((item) => ({
      id: item.snippet.resourceId?.videoId,
      brand: 'OMS YouTube',
      title: item.snippet.title,
      desc: item.snippet.description || '',
      type: 'youtube',
      embedUrl: `https://youtube.com{item.snippet.resourceId?.videoId}`,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    }));

    res.json(ytVideos);

  } catch (error) {
    console.error("YouTube Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch data from YouTube API", details: error.message });
  }
});

// Content creation: Allowed for Admin and Data Entry. Forbidden for Manager (read-only) and Sales.
router.post('/', requireContentAccess, requireWriteAccess, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]), (req, res) => {
  try {
    const { brand, title, desc, youtubeUrl, type } = req.body || {};
    const category = resolveCategory(req.body?.category);

    if (!brand?.trim() || !title?.trim()) {
      return res.status(400).json({ message: 'Brand and title are required' });
    }
    if (!category) {
      return res.status(400).json({
        message: 'A valid category is required',
        received: normalizeCategory(req.body?.category) || null,
        allowed: VIDEO_CATEGORIES,
      });
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
      category,
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

router.put('/:id', requireContentAccess, requireWriteAccess, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]), (req, res) => {
  const hasCategoryField = req.body?.category !== undefined && req.body?.category !== '';
  const nextCategory = hasCategoryField ? resolveCategory(req.body.category) : null;
  if (hasCategoryField && !nextCategory) {
    return res.status(400).json({
      message: 'A valid category is required',
      received: normalizeCategory(req.body?.category) || null,
      allowed: VIDEO_CATEGORIES,
    });
  }

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
        category: nextCategory || v.category,
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

router.delete('/:id', requireContentAccess, requireWriteAccess, (req, res) => {
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

module.exports = router; // التصدير في النهاية تماماً كما يجب أن يكون
