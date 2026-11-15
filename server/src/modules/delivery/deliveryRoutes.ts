import { Router } from 'express';
import { sendInvoice, retryDelivery, getDeliveryLogs } from './deliveryController.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.post(
  '/send',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  sendInvoice
);

router.post(
  '/retry/:logId',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  retryDelivery
);

router.get(
  '/logs/:invoiceId',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT, UserRole.SALES]),
  getDeliveryLogs
);

export default router;
