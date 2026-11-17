import { Router } from 'express';
import { getApprovalRules, updateApprovalRules } from './settingsController.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get('/approval-rules', getApprovalRules);
router.put('/approval-rules', requireRoles([UserRole.ADMIN]), updateApprovalRules);

export default router;
