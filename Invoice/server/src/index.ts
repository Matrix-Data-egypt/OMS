import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/authRoutes.js';
import clientRoutes from './modules/clients/clientRoutes.js';
import serviceRoutes from './modules/services/serviceRoutes.js';
import invoiceRoutes from './modules/invoices/invoiceRoutes.js';
import approvalRoutes from './modules/approvals/approvalRoutes.js';
import paymentRoutes from './modules/payments/paymentRoutes.js';
import deliveryRoutes from './modules/delivery/deliveryRoutes.js';
import settingsRoutes from './modules/settings/settingsRoutes.js';
import reportRoutes from './modules/reports/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Request logger for audit
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'OMS Invoice Management System',
    company: 'OMS',
    developer: 'MDE – Matrix Data Egypt',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ غير متوقع في الخادم الداخلي',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const server = app.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`🚀 OMS Invoice API running on http://127.0.0.1:${PORT}`);
  console.log(`🌟 System: OMS Invoice | Developed by MDE – Matrix Data Egypt`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} is in use, trying port ${Number(PORT) + 1}...`);
    app.listen(Number(PORT) + 1, '127.0.0.1', () => {
      console.log(`🚀 OMS Invoice API running on http://127.0.0.1:${Number(PORT) + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
