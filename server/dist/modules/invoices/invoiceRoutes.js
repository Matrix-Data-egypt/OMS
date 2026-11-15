"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoiceController_js_1 = require("./invoiceController.js");
const auth_js_1 = require("../../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
// All roles can list invoices (Sales can view relevant ones)
router.get('/', invoiceController_js_1.getInvoices);
router.get('/:id', invoiceController_js_1.getInvoiceById);
// Create invoice: Admin, Finance Manager, Accountant
router.post('/', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), invoiceController_js_1.createInvoice);
// Update invoice: Admin, Finance Manager, Accountant
router.put('/:id', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), invoiceController_js_1.updateInvoice);
// Cancel invoice: Admin, Finance Manager
router.post('/:id/cancel', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER]), invoiceController_js_1.cancelInvoice);
exports.default = router;
