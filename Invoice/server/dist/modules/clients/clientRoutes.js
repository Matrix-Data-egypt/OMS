"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_js_1 = require("./clientController.js");
const auth_js_1 = require("../../middleware/auth.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
// All roles can view and manage clients
router.get('/', clientController_js_1.getClients);
router.get('/:id', clientController_js_1.getClientById);
router.post('/', clientController_js_1.createClient);
router.put('/:id', clientController_js_1.updateClient);
router.delete('/:id', (0, auth_js_1.requireRoles)([client_1.UserRole.ADMIN, client_1.UserRole.FINANCE_MANAGER, client_1.UserRole.ACCOUNTANT]), clientController_js_1.deleteClient);
exports.default = router;
