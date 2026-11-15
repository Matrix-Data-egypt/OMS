"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Starting OMS Invoice Seed ---');
    // 1. Seed Users
    const passwordHash = await bcryptjs_1.default.hash('Oms@123456', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@oms.com' },
        update: {},
        create: {
            email: 'admin@oms.com',
            name: 'مدير النظام (Admin)',
            passwordHash,
            role: client_1.UserRole.ADMIN,
            phone: '+201000000001',
        },
    });
    const financeManager = await prisma.user.upsert({
        where: { email: 'finance@oms.com' },
        update: {},
        create: {
            email: 'finance@oms.com',
            name: 'أحمد سعيد (Finance Manager)',
            passwordHash,
            role: client_1.UserRole.FINANCE_MANAGER,
            phone: '+201000000002',
        },
    });
    const accountant = await prisma.user.upsert({
        where: { email: 'accountant@oms.com' },
        update: {},
        create: {
            email: 'accountant@oms.com',
            name: 'محمود فهمي (Accountant)',
            passwordHash,
            role: client_1.UserRole.ACCOUNTANT,
            phone: '+201000000003',
        },
    });
    const sales = await prisma.user.upsert({
        where: { email: 'sales@oms.com' },
        update: {},
        create: {
            email: 'sales@oms.com',
            name: 'سارة خالد (Sales Representative)',
            passwordHash,
            role: client_1.UserRole.SALES,
            phone: '+201000000004',
        },
    });
    console.log('✅ Users seeded successfully');
    // 2. Seed Approval Rules (Dynamic, strictly non-overlapping, stored in DB)
    await prisma.approvalRule.deleteMany({}); // clean before re-seeding rules
    await prisma.approvalRule.createMany({
        data: [
            {
                levelOrder: 1,
                minAmount: 0,
                maxAmount: 15000,
                requiredRole: client_1.UserRole.ACCOUNTANT,
                description: 'الفواتير العادية والصغيرة (حتى 15,000 ج.م)',
            },
            {
                levelOrder: 2,
                minAmount: 15000.01,
                maxAmount: 60000,
                requiredRole: client_1.UserRole.FINANCE_MANAGER,
                description: 'الفواتير المتوسطة وحملات التسويق (15,001 إلى 60,000 ج.م)',
            },
            {
                levelOrder: 3,
                minAmount: 60000.01,
                maxAmount: 10000000,
                requiredRole: client_1.UserRole.ADMIN,
                description: 'الفواتير الكبرى ومشاريع البرمجيات الاستثنائية (أكثر من 60,000 ج.م)',
            },
        ],
    });
    console.log('✅ Approval rules (3 tiers) seeded successfully');
    // 3. Seed Services
    const sampleServices = [
        {
            nameAr: 'إدارة وتخطيط الحملات الإعلانية',
            nameEn: 'Digital Marketing Campaign Management',
            description: 'إدارة شهرية للحملات الإعلانية على منصات التواصل ومحركات البحث',
            defaultPrice: 12000,
            defaultTaxRate: 14,
        },
        {
            nameAr: 'تصميم هوية بصرية كاملة',
            nameEn: 'Brand Identity Design',
            description: 'شعار، دليل استخدام الهوية، بطاقات ومطبوعات مكتبية',
            defaultPrice: 25000,
            defaultTaxRate: 14,
        },
        {
            nameAr: 'تطوير موقع ويب تعريفي (Corporate Web)',
            nameEn: 'Corporate Website Development',
            description: 'تصميم وبرمجة موقع احترافي مع لوحة تحكم سريعة',
            defaultPrice: 40000,
            defaultTaxRate: 14,
        },
        {
            nameAr: 'تطوير تطبيق ويب مخصص (Custom Web App)',
            nameEn: 'Custom Web Application Development',
            description: 'تنفيذ وتطوير نظام برمجي سحابي متكامل',
            defaultPrice: 85000,
            defaultTaxRate: 14,
        },
        {
            nameAr: 'خدمات تحسين محركات البحث (SEO)',
            nameEn: 'Search Engine Optimization (SEO)',
            description: 'تحسين الكلمات المفتاحية وربط التقارير الفنية شهرياً',
            defaultPrice: 15000,
            defaultTaxRate: 14,
        },
    ];
    for (const s of sampleServices) {
        await prisma.service.create({
            data: s,
        });
    }
    console.log('✅ Default services seeded successfully');
    // 4. Seed Clients
    const sampleClients = [
        {
            name: 'شركة النيل للتجارة والاستثمار',
            companyName: 'Nile Trade & Investment SAE',
            email: 'info@niletrade.com',
            phone: '+201222334455',
            whatsappNumber: '+201222334455',
            taxNumber: '100-234-567',
            address: 'القاهرة، المعادي - برج النيل الإداري',
            notes: 'عميل سنوي - دفعات منتظمة',
        },
        {
            name: 'مجموعة الأهرام العقارية',
            companyName: 'Al-Ahram Real Estate Group',
            email: 'marketing@alahram-re.com',
            phone: '+201011223344',
            whatsappNumber: '+201011223344',
            taxNumber: '299-876-123',
            address: 'الجيزة، الشيخ زايد - سنتر الأهرام',
            notes: 'عقد تسويق وتطوير موقع',
        },
    ];
    for (const c of sampleClients) {
        await prisma.client.create({
            data: c,
        });
    }
    console.log('✅ Default clients seeded successfully');
    console.log('--- Seed finished successfully ---');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
