
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import prisma from './prismaClient';

dotenv.config();

async function createMediaAdmin() {
  const email = 'media.admin@oms.com';
  const username = 'media_admin';
  const password = process.env.MEDIA_ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error(
      'MEDIA_ADMIN_PASSWORD must contain at least 12 characters.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$executeRaw`
    INSERT INTO public.users (
      id,
      email,
      username,
      "passwordHash",
      name,
      role,
      "systemAccess",
      "isActive",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${randomUUID()},
      ${email},
      ${username},
      ${passwordHash},
      'Media Administrator',
      'MEDIA_ADMIN'::"public"."UserRole",
      'MEDIA',
      TRUE,
      NOW(),
      NOW()
    )
    ON CONFLICT (email)
    DO UPDATE SET
      username = EXCLUDED.username,
      "passwordHash" = EXCLUDED."passwordHash",
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      "systemAccess" = EXCLUDED."systemAccess",
      "isActive" = TRUE,
      "updatedAt" = NOW()
  `;

  console.log('Media Admin account created or updated.');
}

createMediaAdmin()
  .catch((error) => {
    console.error('Media Admin creation failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
