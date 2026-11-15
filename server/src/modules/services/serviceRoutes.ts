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

// Only ADMIN and FINANCE_MANAGER can create/edit/delete services
router.post('/', requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER]), createService);
router.put('/:id', requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER]), updateService);
router.delete('/:id', requireRoles([UserRole.ADMIN, UserRole.FINANCE_MANAGER]), deleteService);

export default router;
