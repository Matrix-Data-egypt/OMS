import prisma from '../prisma/prismaClient.js';
import crypto from 'crypto';
async function main() {
    console.log('--- Syncing Media Clients to Accounting (Invoices) ---');
    const mediaClients = await prisma.mediaClient.findMany();
    let count = 0;
    for (const mc of mediaClients) {
        const existing = await prisma.$queryRaw `
      SELECT id FROM "public"."clients" WHERE "name" = ${mc.name} LIMIT 1
    `;
        if (existing.length === 0) {
            const id = crypto.randomUUID();
            await prisma.$executeRaw `
        INSERT INTO "public"."clients" ("id", "name", "companyName", "notes", "isActive", "createdAt", "updatedAt")
        VALUES (${id}, ${mc.name}, ${mc.name}, 'عميل مسجل عبر قسم الميديا', true, NOW(), NOW())
      `;
            console.log(`✅ Synced new client to Accounting: ${mc.name}`);
            count++;
        }
        else {
            console.log(`ℹ️ Already in Accounting: ${mc.name}`);
        }
    }
    console.log(`--- Finished: ${count} new clients added to Accounting ---`);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
