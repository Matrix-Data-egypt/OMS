
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

// Allowed frontend origins
const allowedOrigins = [
  'https://matrix-data-egypt.github.io',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/content-types', contentTypeRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/accounting', accountingRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    system: 'OMS Media Department API',
    company: 'OMS',
    developer: 'MDE – Matrix Data Egypt',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Export Express app for Vercel
export default app;
