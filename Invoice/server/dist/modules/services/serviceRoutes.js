"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_js_1 = require("./serviceController.js");
const auth_js_1 = require("../../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
// All users can view services (to select them in invoices)
router.get('/', serviceController_js_1.getServices);
// ADMIN, FINANCE_MANAGER, and ACCOUNTANT can manage services
router.post('/', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), serviceController_js_1.createService);
router.put('/:id', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), serviceController_js_1.updateService);
router.delete('/:id', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), serviceController_js_1.deleteService);
exports.default = router;
