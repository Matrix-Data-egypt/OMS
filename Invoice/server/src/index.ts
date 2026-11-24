
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// ==========================================
// Routes
// ==========================================

import approvalRoutes from './modules/approvals/approvalRoutes.js';
import authRoutes from './modules/auth/authRoutes.js';
import clientRoutes from './modules/clients/clientRoutes.js';
import deliveryRoutes from './modules/delivery/deliveryRoutes.js';
import invoiceRoutes from './modules/invoices/invoiceRoutes.js';
import paymentRoutes from './modules/payments/paymentRoutes.js';
import reportRoutes from './modules/reports/reportRoutes.js';
import serviceRoutes from './modules/services/serviceRoutes.js';
import settingsRoutes from './modules/settings/settingsRoutes.js';

const app = express();

// ==========================================
// CORS Configuration
// ==========================================

const allowedOrigins = [
  'https://oms-invoice-client-lyart.vercel.app',
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
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured production and local origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Invoice Vercel preview deployments
      const isInvoicePreview =
        /^https:\/\/oms-invoice-client-[a-z0-9-]+-pixelrun2000-9580s-projects\.vercel\.app$/.test(
          origin
        );

      if (isInvoicePreview) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  })
);

// ==========================================
// Middleware
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Health Check
// ==========================================

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'OMS Invoice API is running',
    company: 'Matrix Data Egypt (MDE)',
    health: '/api/health',
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    system: 'OMS Invoice Management System',
    developer: 'Matrix Data Egypt (MDE)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// API Routes
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingsRoutes);

// ==========================================
// 404 Handler
// ==========================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// ==========================================
// Global Error Handler
// ==========================================

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error('API Error:', error);

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
// Export for Vercel
// ==========================================

export default app;
