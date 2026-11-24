
app.put(
  [
    '/api/users/:id/password',
    '/api/users/:id/reset-password'
  ],
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (
        typeof newPassword !== 'string' ||
        newPassword.trim().length < 6
      ) {
        res.status(400).json({
          success: false,
          message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف'
        });
        return;
      }

      if (req.user?.id === id) {
        res.status(400).json({
          success: false,
          message: 'لا يمكنك تغيير كلمة مرور حسابك من هذه العملية'
        });
        return;
      }

      const existingUser = await pool.query(
        `SELECT id, name
         FROM "public"."users"
         WHERE id = $1`,
        [id]
      );

      if (existingUser.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
        return;
      }

      const passwordHash = await bcrypt.hash(
        newPassword,
        10
      );

      const result = await pool.query(
        `UPDATE "public"."users"
         SET "passwordHash" = $1,
             "updatedAt" = NOW()
         WHERE id = $2
         RETURNING id, name`,
        [passwordHash, id]
      );

      res.status(200).json({
        success: true,
        message: `تم تغيير كلمة مرور (${result.rows[0].name}) بنجاح`
      });

    } catch (error) {
      console.error('Reset password error:', error);

      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
      });
    }
  }
);
