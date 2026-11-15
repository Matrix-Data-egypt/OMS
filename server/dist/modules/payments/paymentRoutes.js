"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_js_1 = require("./paymentController.js");
const auth_js_1 = require("../../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
// Record payment: Admin, Finance Manager, Accountant
router.post('/', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), paymentController_js_1.recordPayment);
router.get('/', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), paymentController_js_1.getPayments);
exports.default = router;
