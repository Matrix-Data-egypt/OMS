"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_js_1 = __importDefault(require("./modules/auth/authRoutes.js"));
const clientRoutes_js_1 = __importDefault(require("./modules/clients/clientRoutes.js"));
const serviceRoutes_js_1 = __importDefault(require("./modules/services/serviceRoutes.js"));
const invoiceRoutes_js_1 = __importDefault(require("./modules/invoices/invoiceRoutes.js"));
const approvalRoutes_js_1 = __importDefault(require("./modules/approvals/approvalRoutes.js"));
const paymentRoutes_js_1 = __importDefault(require("./modules/payments/paymentRoutes.js"));
const deliveryRoutes_js_1 = __importDefault(require("./modules/delivery/deliveryRoutes.js"));
const settingsRoutes_js_1 = __importDefault(require("./modules/settings/settingsRoutes.js"));
const reportRoutes_js_1 = __importDefault(require("./modules/reports/reportRoutes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
}));
app.use(express_1.default.json());
// Request logger for audit
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});
// API Routes
app.use('/api/auth', authRoutes_js_1.default);
app.use('/api/clients', clientRoutes_js_1.default);
app.use('/api/services', serviceRoutes_js_1.default);
app.use('/api/invoices', invoiceRoutes_js_1.default);
app.use('/api/approvals', approvalRoutes_js_1.default);
app.use('/api/payments', paymentRoutes_js_1.default);
app.use('/api/delivery', deliveryRoutes_js_1.default);
app.use('/api/settings', settingsRoutes_js_1.default);
app.use('/api/reports', reportRoutes_js_1.default);
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
app.use((err, req, res, next) => {
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
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${PORT} is in use, trying port ${Number(PORT) + 1}...`);
        app.listen(Number(PORT) + 1, '127.0.0.1', () => {
            console.log(`🚀 OMS Invoice API running on http://127.0.0.1:${Number(PORT) + 1}`);
        });
    }
    else {
        console.error('Server error:', err);
    }
});
