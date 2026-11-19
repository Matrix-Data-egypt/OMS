
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import prisma from './prismaClient.js';

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

  const existingUsers = await prisma.$queryRaw<any[]>`
    SELECT id, email, username, role, "systemAccess"
    FROM public.users
    WHERE email = ${email}
       OR username = ${username}
    LIMIT 1
  `;

  if (existingUsers.length > 0) {
    throw new Error(
      'A user with this email or username already exists. No changes were made.'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$executeRaw`
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
  `;

  console.log('Media Admin account created successfully.');
}

createMediaAdmin()
  .catch((error) => {
    console.error('Media Admin creation failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
