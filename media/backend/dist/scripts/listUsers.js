import prisma from '../prisma/prismaClient.js';
async function main() {
    const cols = await prisma.$queryRaw `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users'
  `;
    console.log('USERS_COLUMNS:', cols);
}
main().catch(console.error).finally(() => prisma.$disconnect());
