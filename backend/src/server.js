const path = require('path');
const express = require('express');
const cors = require('cors');

const { port } = require('./config');

const authRoutes = require('./routes/auth');
const briefsRoutes = require('./routes/briefs');
const blogRoutes = require('./routes/blog');
const videosRoutes = require('./routes/videos');
const clientsRoutes = require('./routes/clients');
const outdoorRoutes = require('./routes/outdoor');
const possRoutes = require('./routes/poss');

const app = express();

// CORS - يقبل الاتصال تلقائياً محلياً بدون قيود
app.use(
  cors({
    origin: true, 
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Uploaded files
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'OMS API',
  });
});

// API routes - مسارات مشروعك الأصلية النظيفة
app.use('/api/auth', authRoutes);
app.use('/api/briefs', briefsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/videos', videosRoutes); // سيتولى هذا الراوت دمج اليوتيوب بشكل آمن
app.use('/api/clients', clientsRoutes);
app.use('/api/outdoor', outdoorRoutes);
app.use('/api/poss', possRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);

  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

// Start server
const server = app.listen(port, () => {
  console.log('========================================');
  console.log('OMS backend running on http://localhost:' + port);
  console.log('========================================');
});

// Server error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + port + ' is already in use.');
  } else {
    console.error('Server failed to start:', err.message);
  }
  process.exit(1);
});
