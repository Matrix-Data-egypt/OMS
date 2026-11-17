import { Router } from 'express';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from './serviceController.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

// All users can view services (to select them in invoices)
router.get('/', getServices);

// ADMIN, FINANCE_MANAGER, and ACCOUNTANT can manage services
router.post('/', requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]), createService);
router.put('/:id', requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]), updateService);
router.delete('/:id', requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER, UserRole.ACCOUNTANT]), deleteService);

export default router;
