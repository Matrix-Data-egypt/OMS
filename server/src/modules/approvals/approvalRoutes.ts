import { Router } from 'express';
import {
  submitForApproval,
  approveInvoice,
  rejectInvoice,
  getPendingApprovals,
} from './approvalController.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

// All roles who can create invoice (Admin, Finance Manager, Accountant) can submit for approval
router.post(
  '/:id/submit',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  submitForApproval
);

// Review & Approval endpoints
router.get(
  '/pending',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  getPendingApprovals
);

router.post(
  '/:id/approve',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  approveInvoice
);

router.post(
  '/:id/reject',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  rejectInvoice
);

export default router;
