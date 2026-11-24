
import { Response } from 'express';
import { z } from 'zod';
import prisma from '../../prisma/prismaClient.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  InvoiceStatus,
  ApprovalStatus,
  UserRole,
} from '@prisma/client';

// ==========================================
// SUBMIT INVOICE FOR APPROVAL
// ==========================================

export const submitForApproval = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'غير مصرح',
      });
      return;
    }

    // Prevent media-only accounts from submitting invoices.
    if (
      req.user.role === UserRole.MEDIA_ADMIN ||
      req.user.systemAccess === 'MEDIA'
    ) {
      res.status(403).json({
        success: false,
        message: 'حساب الميديا غير مصرح له باستخدام نظام الفواتير',
      });
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة',
      });
      return;
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      res.status(400).json({
        success: false,
        message: 'يمكن إرسال الفواتير التي في حالة مسودة (Draft) فقط للاعتماد',
      });
      return;
    }

    const amount = Number(invoice.totalAmount);

    // Fetch dynamic approval rules from DB.
    const applicableRules = await prisma.approvalRule.findMany({
      where: {
        isActive: true,
        minAmount: { lte: amount },
      },
      orderBy: { levelOrder: 'asc' },
    });

    if (applicableRules.length === 0) {
      res.status(400).json({
        success: false,
        message: 'لا توجد قواعد اعتماد مطابقة لقيمة هذه الفاتورة. يرجى مراجعة مسؤول النظام لضبط approval_rules',
      });
      return;
    }

    // Determine target rule.
    const targetRule = applicableRules.find(
      (rule) =>
        amount >= Number(rule.minAmount) &&
        amount <= Number(rule.maxAmount)
    ) || applicableRules[applicableRules.length - 1];

    await prisma.$transaction(async (tx) => {
      // Clear previous approval steps.
      await tx.approvalStep.deleteMany({
        where: { invoiceId: id },
      });

      // Create the required approval step.
      await tx.approvalStep.create({
        data: {
          invoiceId: id,
          ruleId: targetRule.id,
          levelOrder: targetRule.levelOrder,
          status: ApprovalStatus.PENDING,
        },
      });

      // Update invoice status.
      await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.PENDING_APPROVAL,
        },
      });

      // Create audit log.
      await tx.auditLog.create({
        data: {
          entity: 'INVOICE',
          entityId: id,
          action: 'SUBMIT_FOR_APPROVAL',
          performedById: req.user!.id,
          details: `تم تقديم الفاتورة رقم ${invoice.invoiceNumber} للاعتماد في المستوى ${targetRule.levelOrder} (${targetRule.description || targetRule.requiredRole})`,
        },
      });
    });

    res.json({
      success: true,
      message: `تم إرسال الفاتورة بنجاح للاعتماد (المستوى ${targetRule.levelOrder} - ${targetRule.requiredRole})`,
    });

  } catch (error: any) {
    console.error('submitForApproval error:', error);

    res.status(500).json({
      success: false,
      message: 'خطأ أثناء إرسال الفاتورة للاعتماد',
    });
  }
};

// ==========================================
// APPROVE INVOICE VALIDATION
// ==========================================

const approveSchema = z.object({
  comments: z.string().optional(),
});

// ==========================================
// APPROVE AND ISSUE INVOICE
// ==========================================

export const approveInvoice = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'غير مصرح',
      });
      return;
    }

    const parseResult = approveSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'بيانات الطلب غير صحيحة',
        errors: parseResult.error.errors,
      });
      return;
    }

    const comments = parseResult.data.comments;

    // Block media accounts.
    if (
      req.user.role === UserRole.MEDIA_ADMIN ||
      req.user.systemAccess === 'MEDIA'
    ) {
      res.status(403).json({
        success: false,
        message: 'حساب الميديا غير مصرح له باعتماد الفواتير',
      });
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        approvalSteps: {
          where: {
            status: ApprovalStatus.PENDING,
          },
          include: {
            rule: true,
          },
          orderBy: {
            levelOrder: 'asc',
          },
        },
        items: true,
      },
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة',
      });
      return;
    }

    if (invoice.status !== InvoiceStatus.PENDING_APPROVAL) {
      res.status(400).json({
        success: false,
        message: 'الفاتورة ليست في حالة انتظار الاعتماد',
      });
      return;
    }

    // Separation of duties:
    // The creator cannot approve their own invoice.
    if (invoice.createdById === req.user.id) {
      res.status(403).json({
        success: false,
        message: 'غير مسموح نظاماً: لا يمكنك اعتماد فاتورة قمت أنت بإنشائها بنفسك (مبدأ فصل المهام)',
      });
      return;
    }

    const pendingStep = invoice.approvalSteps[0];

    if (!pendingStep) {
      res.status(400).json({
        success: false,
        message: 'لا توجد خطوة اعتماد معلقة لهذه الفاتورة',
      });
      return;
    }

    // ==========================================
    // ROLE AUTHORITY
    // ==========================================

    const userRole = req.user.role;
    const requiredRole = pendingStep.rule?.requiredRole;

    // Higher number means higher approval authority.
    const roleHierarchies: Record<UserRole, number> = {
      SALES: 1,
      ACCOUNTANT: 2,
      FINANCE_MANAGER: 3,
      ADMIN: 4,
      MEDIA_ADMIN: 0,
    };

    // MEDIA_ADMIN cannot be an invoice approver.
    if (requiredRole === UserRole.MEDIA_ADMIN) {
      console.error(
        'APPROVAL CONFIGURATION ERROR: MEDIA_ADMIN cannot approve invoices'
      );

      res.status(500).json({
        success: false,
        message: 'إعدادات مستوى الاعتماد غير صحيحة. يرجى مراجعة مسؤول النظام.',
      });
      return;
    }

    const userLevel = roleHierarchies[userRole];

    const requiredLevel = requiredRole
      ? roleHierarchies[requiredRole]
      : roleHierarchies.FINANCE_MANAGER;

    // Admin has super approval authority.
    if (
      userRole !== UserRole.ADMIN &&
      userLevel < requiredLevel
    ) {
      res.status(403).json({
        success: false,
        message: `هذا المستوى من الفواتير يتطلب اعتماد رتبة (${requiredRole || 'FINANCE_MANAGER'}) أو أعلى`,
      });
      return;
    }

    // ==========================================
    // EXECUTE APPROVAL
    // ==========================================

    await prisma.$transaction(async (tx) => {
      // 1. Update approval step.
      await tx.approvalStep.update({
        where: {
          id: pendingStep.id,
        },
        data: {
          status: ApprovalStatus.APPROVED,
          approverId: req.user!.id,
          comments: comments || 'تم الاعتماد بنجاح',
          actionDate: new Date(),
        },
      });

      // 2. Freeze taxes into invoice_taxes.
      await tx.invoiceTax.deleteMany({
        where: { invoiceId: id },
      });

      const vatAmount = Number(invoice.taxAmount);

      await tx.invoiceTax.create({
        data: {
          invoiceId: id,
          taxName: 'ضريبة القيمة المضافة (VAT 14%)',
          taxRate: 14.00,
          taxAmount: vatAmount,
          isWithholding: false,
        },
      });

      // 3. Update invoice status.
      await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.ISSUED,
        },
      });

      // 4. Create audit log.
      await tx.auditLog.create({
        data: {
          entity: 'INVOICE',
          entityId: id,
          action: 'APPROVE_AND_ISSUE',
          performedById: req.user!.id,
          details: `تم اعتماد الفاتورة رقم ${invoice.invoiceNumber} بقيمة ${invoice.totalAmount} ج.م وإصدارها رسمياً وتجميد الضرائب بواسطة ${req.user!.name} (${req.user!.role})`,
        },
      });
    });

    res.json({
      success: true,
      message: `تم اعتماد وإصدار الفاتورة رقم ${invoice.invoiceNumber} بنجاح وتجميد الضرائب`,
    });

  } catch (error: any) {
    console.error('approveInvoice error:', error);

    res.status(500).json({
      success: false,
      message: 'خطأ أثناء اعتماد الفاتورة',
    });
  }
};

// ==========================================
// REJECT INVOICE
// ==========================================

export const rejectInvoice = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'غير مصرح',
      });
      return;
    }

    // Block media accounts.
    if (
      req.user.role === UserRole.MEDIA_ADMIN ||
      req.user.systemAccess === 'MEDIA'
    ) {
      res.status(403).json({
        success: false,
        message: 'حساب الميديا غير مصرح له برفض الفواتير',
      });
      return;
    }

    if (
      typeof comments !== 'string' ||
      comments.trim().length === 0
    ) {
      res.status(400).json({
        success: false,
        message: 'يجب ذكر سبب الرفض في الملاحظات',
      });
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        approvalSteps: {
          where: {
            status: ApprovalStatus.PENDING,
          },
        },
      },
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'الفاتورة غير موجودة',
      });
      return;
    }

    if (invoice.status !== InvoiceStatus.PENDING_APPROVAL) {
      res.status(400).json({
        success: false,
        message: 'الفاتورة ليست في حالة انتظار الاعتماد',
      });
      return;
    }

    if (invoice.createdById === req.user.id) {
      res.status(403).json({
        success: false,
        message: 'لا يمكنك رفض فاتورة قمت بإنشائها بنفسك',
      });
      return;
    }

    const pendingStep = invoice.approvalSteps[0];

    if (!pendingStep) {
      res.status(400).json({
        success: false,
        message: 'لا توجد خطوة اعتماد معلقة لهذه الفاتورة',
      });
      return;
    }

    // ==========================================
    // ROLE AUTHORITY FOR REJECTION
    // ==========================================

    const roleHierarchies: Record<UserRole, number> = {
      SALES: 1,
      ACCOUNTANT: 2,
      FINANCE_MANAGER: 3,
      ADMIN: 4,
      MEDIA_ADMIN: 0,
    };

    const userRole = req.user.role;
    const requiredRole = pendingStep.rule?.requiredRole;

    if (
      userRole === UserRole.MEDIA_ADMIN ||
      req.user.systemAccess === 'MEDIA'
    ) {
      res.status(403).json({
        success: false,
        message: 'حساب الميديا غير مصرح له برفض الفواتير',
      });
      return;
    }

    if (requiredRole === UserRole.MEDIA_ADMIN) {
      res.status(500).json({
        success: false,
        message: 'إعدادات مستوى الاعتماد غير صحيحة. يرجى مراجعة مسؤول النظام.',
      });
      return;
    }

    const userLevel = roleHierarchies[userRole];

    const requiredLevel = requiredRole
      ? roleHierarchies[requiredRole]
      : roleHierarchies.FINANCE_MANAGER;

    if (
      userRole !== UserRole.ADMIN &&
      userLevel < requiredLevel
    ) {
      res.status(403).json({
        success: false,
        message: `هذا المستوى من الفواتير يتطلب رتبة (${requiredRole || 'FINANCE_MANAGER'}) أو أعلى`,
      });
      return;
    }

    // ==========================================
    // EXECUTE REJECTION
    // ==========================================

    await prisma.$transaction(async (tx) => {
      await tx.approvalStep.update({
        where: {
          id: pendingStep.id,
        },
        data: {
          status: ApprovalStatus.REJECTED,
          approverId: req.user!.id,
          comments: comments.trim(),
          actionDate: new Date(),
        },
      });

      await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.DRAFT,
        },
      });

      await tx.auditLog.create({
        data: {
          entity: 'INVOICE',
          entityId: id,
          action: 'REJECT',
          performedById: req.user!.id,
          details: `تم رفض الفاتورة رقم ${invoice.invoiceNumber} وإعادتها لمسودة. السبب: ${comments.trim()}`,
        },
      });
    });

    res.json({
      success: true,
      message: 'تم رفض الفاتورة وإعادتها إلى مسودة للتعديل',
    });

  } catch (error: any) {
    console.error('rejectInvoice error:', error);

    res.status(500).json({
      success: false,
      message: 'خطأ أثناء رفض الفاتورة',
    });
  }
};

// ==========================================
// GET PENDING APPROVALS
// ==========================================

export const getPendingApprovals = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'غير مصرح',
      });
      return;
    }

    // Block media-only accounts.
    if (
      req.user.role === UserRole.MEDIA_ADMIN ||
      req.user.systemAccess === 'MEDIA'
    ) {
      res.status(403).json({
        success: false,
        message: 'حساب الميديا غير مصرح له بعرض طلبات اعتماد الفواتير',
      });
      return;
    }

    const currentUserId = req.user.id;

    const invoices = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.PENDING_APPROVAL,
        createdById: {
          not: currentUserId,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        approvalSteps: {
          where: {
            status: ApprovalStatus.PENDING,
          },
          include: {
            rule: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return pending invoices.
    res.json({
      success: true,
      data: invoices,
    });

  } catch (error: any) {
    console.error('getPendingApprovals error:', error);

    res.status(500).json({
      success: false,
      message: 'خطأ في جلب طلبات الاعتماد',
    });
  }
};
