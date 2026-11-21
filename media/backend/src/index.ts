
import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import clientRoutes from './routes/clients.js';
import supplierRoutes from './routes/suppliers.js';
import channelRoutes from './routes/channels.js';
import contentTypeRoutes from './routes/contentTypes.js';
import contentRoutes from './routes/contents.js';
import recordRoutes from './routes/records.js';
import accountingRoutes from './routes/accountingIntegration.js';
import authRoutes from './routes/auth.js';

const app = express();

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  'https://matrix-data-egypt.github.io',
  'https://oms-tur2.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      const isAllowedVercelPreview =
        /^https:\/\/oms-tur2-[a-z0-9-]+-pixelrun2000-9580s-projects\.vercel\.app$/.test(
          origin || ''
        );

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isAllowedVercelPreview
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ==========================================
// Middleware
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Root
// ==========================================

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'OMS Media Department API is running',
    company: 'MDE - Matrix Data Egypt',
    health: '/api/health',
  });
});

// ==========================================
// Health Check
// ==========================================

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    system: 'OMS Media Department API',
    company: 'OMS',
    developer: 'MDE - Matrix Data Egypt',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// API Routes
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/content-types', contentTypeRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/accounting', accountingRoutes);

// ==========================================
// 404
// ==========================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// ==========================================
// Error Handler
// ==========================================

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('API Error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && {
        error: error.message,
      }),
    });
  }
);

// ==========================================
// Vercel Serverless
// ==========================================

export default app;
