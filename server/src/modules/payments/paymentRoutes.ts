import { Router } from 'express';
import { recordPayment, getPayments } from './paymentController.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

// Record payment: Admin, Finance Manager, Accountant
router.post(
  '/',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  recordPayment
);

router.get(
  '/',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  getPayments
);

export default router;
