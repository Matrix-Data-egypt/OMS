
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';

// ==========================================
// ROUTES
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
// CORS CONFIGURATION
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

const isAllowedOrigin = (origin: string): boolean => {
  const normalizedOrigin = origin.replace(/\/$/, '');

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // Allow Vercel preview deployments for this frontend.
  return /^https:\/\/oms-invoice-client-[a-z0-9-]+-pixelrun2000-9580s-projects\.vercel\.app$/.test(
    normalizedOrigin
  );
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Requests without an Origin header are allowed.
    if (!origin) {
      return callback(null, true);
    }

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn('CORS BLOCKED ORIGIN:', origin);

    // Do not throw an Express error for a blocked origin.
    return callback(null, false);
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
  ],

  optionsSuccessStatus: 204,
  preflightContinue: false,
};

// CORS must run before all routes and body parsing.
app.use(cors(corsOptions));

// ==========================================
// REQUEST LOGGING
// ==========================================

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log('API REQUEST:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin || null,
  });

  next();
});

// ==========================================
// BODY PARSING
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// HEALTH CHECK
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
// API ROUTES
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
// 404 HANDLER
// ==========================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error('GLOBAL API ERROR:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (res.headersSent) {
      return;
    }

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
// EXPORT FOR VERCEL
// ==========================================

export default app;
