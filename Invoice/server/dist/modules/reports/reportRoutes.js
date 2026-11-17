"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_js_1 = require("./reportController.js");
const auth_js_1 = require("../../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
// Financial Overview: Admin, Finance Manager, Accountant
router.get('/overview', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), reportController_js_1.getFinancialOverview);
// Audit Logs: Admin, Finance Manager
router.get('/audit-logs', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER]), reportController_js_1.getAuditLogs);
exports.default = router;
