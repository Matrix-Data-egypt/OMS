import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import clientRoutes from './routes/clients.js';
import supplierRoutes from './routes/suppliers.js';
import channelRoutes from './routes/channels.js';
import contentTypeRoutes from './routes/contentTypes.js';
import contentRoutes from './routes/contents.js';
import recordRoutes from './routes/records.js';
import accountingRoutes from './routes/accountingIntegration.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5002;

app.use(
  cors({
    origin: [
      'https://github.io',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/content-types', contentTypeRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/accounting', accountingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'OMS Media Department API',
    company: 'OMS',
    developer: 'MDE – Matrix Data Egypt',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Listen on 0.0.0.0 so Render can route traffic to the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OMS Media Department API running on port ${PORT}`);
  console.log(`🌟 Media Section | Developed by MDE – Matrix Data Egypt`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} is in use, trying port ${PORT + 1}...`);
    app.listen(PORT + 1, '0.0.0.0', () => {
      console.log(`🚀 OMS Media Department API running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
