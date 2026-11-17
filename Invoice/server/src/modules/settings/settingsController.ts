import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../prisma/prismaClient.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const approvalRuleSchema = z.object({
  levelOrder: z.number().int().positive(),
  minAmount: z.number().nonnegative(),
  maxAmount: z.number().positive(),
  requiredRole: z.nativeEnum(UserRole),
  description: z.string().optional(),
});

export const getApprovalRules = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rules = await prisma.approvalRule.findMany({
      orderBy: { levelOrder: 'asc' },
    });
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'خطأ في جلب قواعد الاعتماد' });
  }
};

export const updateApprovalRules = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'غير مصرح' });
      return;
    }

    const rulesArraySchema = z.array(approvalRuleSchema).min(1, 'يجب تحديد مستوى واحد على الأقل');
    const parseResult = rulesArraySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const rules = parseResult.data;

    // Validate that rules do not overlap and are strictly sequential
    // Sort by minAmount
    const sorted = [...rules].sort((a, b) => a.minAmount - b.minAmount);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].maxAmount >= sorted[i + 1].minAmount) {
        res.status(400).json({
          success: false,
          message: `خطأ في النطاق: الحدود المالية بين المستوى ${sorted[i].levelOrder} والمستوى ${sorted[i + 1].levelOrder} متداخلة (${sorted[i].maxAmount} ج.م >= ${sorted[i + 1].minAmount} ج.م)`,
        });
        return;
      }
    }

    // Replace rules in database
    await prisma.$transaction(async (tx) => {
      await tx.approvalRule.deleteMany({});

      for (let i = 0; i < sorted.length; i++) {
        await tx.approvalRule.create({
          data: {
            levelOrder: i + 1,
            minAmount: sorted[i].minAmount,
            maxAmount: sorted[i].maxAmount,
            requiredRole: sorted[i].requiredRole,
            description: sorted[i].description,
            isActive: true,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          entity: 'APPROVAL_RULES',
          entityId: 'ALL',
          action: 'UPDATE_APPROVAL_RULES',
          performedById: req.user!.id,
          details: `قام مسؤول النظام ${req.user!.name} بتحديث قواعد وحدود مستويات الاعتماد (${sorted.length} مستويات)`,
        },
      });
    });

    const updated = await prisma.approvalRule.findMany({ orderBy: { levelOrder: 'asc' } });
    res.json({
      success: true,
      data: updated,
      message: 'تم تحديث حدود وقواعد الاعتماد بنجاح والتأكد من عدم وجود أي تداخلات مالية',
    });
  } catch (error: any) {
    console.error('updateApprovalRules error:', error);
    res.status(500).json({ success: false, message: 'خطأ أثناء تحديث قواعد الاعتماد' });
  }
};
