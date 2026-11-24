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
    if (req.user.systemAccess === 'MEDIA') {
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
