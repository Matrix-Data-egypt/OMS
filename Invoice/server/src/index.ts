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
const PORT = Number(process.env.PORT) || 5001;

// إعدادات CORS مرنة وشاملة لـ GitHub Pages و Vercel والمحلي
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // السماح بالطلبات بدون origin (مثل Postman أو تطبيقات الموبايل)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://matrix-data-egypt.github.io',
      'https://github.io',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ];

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.github.io') ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
// معالجة طلبات Preflight (OPTIONS) لجميع المسارات فوراً
app.options('*', cors(corsOptions));

app.use(express.json());

// Request logger for audit
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Root route for quick verification
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OMS Invoice API is running on Vercel',
  });
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

// تشغيل الخادم محليًا فقط؛ أما على Vercel فيتم تصديره كـ Serverless Function
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OMS Invoice API running on port ${PORT}`);
  });
}

export default app;
