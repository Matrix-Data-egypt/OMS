const path = require('path');
const express = require('express');
const cors = require('cors');
const { port, frontendUrl, adminUrl } = require('./config');

const authRoutes = require('./routes/auth');
const briefsRoutes = require('./routes/briefs');
const blogRoutes = require('./routes/blog');
const videosRoutes = require('./routes/videos');
const clientsRoutes = require('./routes/clients');

const app = express();

app.use(
  cors({
    origin: [frontendUrl, adminUrl, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'OMS API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/briefs', briefsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/clients', clientsRoutes);

// Express 5 error handler for multer etc.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

app.listen(port, () => {
  console.log(`OMS backend running on http://localhost:${port}`);
});
