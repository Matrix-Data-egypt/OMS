import { Router } from 'express';
import { getFinancialOverview, getAuditLogs } from './reportController.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

// Financial Overview: Admin, Finance Manager, Accountant
router.get(
  '/overview',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  getFinancialOverview
);

// Audit Logs: Admin, Finance Manager
router.get(
  '/audit-logs',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER]),
  getAuditLogs
);

export default router;
