import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../prisma/prismaClient.js';
async function main() {
    const existing = await prisma.$queryRaw `
    SELECT id, name, username, email FROM "public"."users" 
    WHERE username IN ('manager', 'modir', 'مدير') OR email = 'manager@oms.com'
  `;
    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 10);
    if (existing.length > 0) {
        const user = existing[0];
        await prisma.$executeRaw `
      UPDATE "public"."users"
      SET "name" = 'مدير (متابعة وعرض فقط)',
          "username" = 'manager',
          "email" = 'manager@oms.com',
          "passwordHash" = ${passwordHash},
          "systemAccess" = 'MEDIA',
          "isActive" = true,
          "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;
        console.log('UPDATED_EXISTING_USER:', user.id);
    }
    else {
        const newId = crypto.randomUUID();
        await prisma.$executeRaw `
      INSERT INTO "public"."users" (
        "id", "name", "username", "email", "passwordHash", "phone", "role", "systemAccess", "isActive", "createdAt", "updatedAt"
      ) VALUES (
        ${newId},
        'مدير (متابعة وعرض فقط)',
        'manager',
        'manager@oms.com',
        ${passwordHash},
        '01000000000',
        'SALES'::"public"."UserRole",
        'MEDIA',
        true,
        NOW(),
        NOW()
      )
    `;
        console.log('CREATED_NEW_USER:', newId);
    }
    const allMediaUsers = await prisma.$queryRaw `
    SELECT id, name, username, email, "systemAccess", "isActive"
    FROM "public"."users"
    WHERE "systemAccess" = 'MEDIA' OR username = 'manager'
  `;
    console.log('MEDIA_USERS:', allMediaUsers);
}
main().catch(console.error).finally(() => prisma.$disconnect());
