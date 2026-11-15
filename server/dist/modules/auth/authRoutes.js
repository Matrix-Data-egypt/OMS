"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("./authController.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
router.post('/login', authController_js_1.login);
router.get('/me', auth_js_1.authenticateToken, authController_js_1.getProfile);
exports.default = router;
