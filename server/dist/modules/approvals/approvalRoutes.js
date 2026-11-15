"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approvalController_js_1 = require("./approvalController.js");
const auth_js_1 = require("../../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
// All roles who can create invoice (Admin, Finance Manager, Accountant) can submit for approval
router.post('/:id/submit', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), approvalController_js_1.submitForApproval);
// Review & Approval endpoints
router.get('/pending', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), approvalController_js_1.getPendingApprovals);
router.post('/:id/approve', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), approvalController_js_1.approveInvoice);
router.post('/:id/reject', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), approvalController_js_1.rejectInvoice);
exports.default = router;
