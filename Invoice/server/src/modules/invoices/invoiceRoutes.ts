import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  cancelInvoice,
} from './invoiceController.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

// All roles can list invoices (Sales can view relevant ones)
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);

// Create invoice: Admin, Finance Manager, Accountant
router.post(
  '/',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  createInvoice
);

// Update invoice: Admin, Finance Manager, Accountant
router.put(
  '/:id',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]),
  updateInvoice
);

// Cancel invoice: Admin, Finance Manager
router.post(
  '/:id/cancel',
  requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER]),
  cancelInvoice
);

export default router;
