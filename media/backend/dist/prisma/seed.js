import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- Starting OMS Media Department Seed ---');
    // 1. Clients (Name only)
    const clientsData = [
        { name: 'شركة النيل للاستثمار العقاري' },
        { name: 'مجموعة الأهرام للرعاية الصحية' },
        { name: 'مطاعم برجر شوب مصر' },
        { name: 'أكاديمية المستقبل للغات' },
    ];
    const clients = [];
    for (const c of clientsData) {
        const created = await prisma.mediaClient.upsert({
            where: { name: c.name },
            update: {},
            create: c,
        });
        clients.push(created);
    }
    console.log(`✅ ${clients.length} Clients seeded`);
    // 2. Suppliers (Name only)
    const suppliersData = [
        { name: 'Meta Platforms (Facebook & Instagram Ads)' },
        { name: 'Google Ireland Limited (Google & YouTube Ads)' },
        { name: 'TikTok Ads MENA' },
        { name: 'شبكة قنوات المحور التلفزيونية' },
        { name: 'وكالة الأهرام للإعلانات الميدانية' },
    ];
    const suppliers = [];
    for (const s of suppliersData) {
        const created = await prisma.mediaSupplier.upsert({
            where: { name: s.name },
            update: {},
            create: s,
        });
        suppliers.push(created);
    }
    console.log(`✅ ${suppliers.length} Suppliers seeded`);
    // 3. Channels (Name only)
    const channelsData = [
        { name: 'Facebook' },
        { name: 'Instagram' },
        { name: 'Google Search' },
        { name: 'YouTube Video' },
        { name: 'TikTok' },
        { name: 'LinkedIn' },
        { name: 'Television (قنوات فضائية)' },
        { name: 'Outdoor Billboards (شاشات طرق)' },
    ];
    const channels = [];
    for (const ch of channelsData) {
        const created = await prisma.mediaChannel.upsert({
            where: { name: ch.name },
            update: {},
            create: ch,
        });
        channels.push(created);
    }
    console.log(`✅ ${channels.length} Channels seeded`);
    // 4. Content Types (Name only + ID)
    const contentTypesData = [
        { name: 'فيديو إعلاني سينمائي (Commercial Video)' },
        { name: 'ريلز ومقاطع قصيرة (Reels & Shorts)' },
        { name: 'تصميم جرافيك ثابت (Static Banner / Post)' },
        { name: 'منشور متعدد الصور (Carousel Post)' },
        { name: 'محتوى كتابي ومقال تسويقي (Copywriting)' },
    ];
    const contentTypes = [];
    for (const ct of contentTypesData) {
        const created = await prisma.mediaContentType.upsert({
            where: { name: ct.name },
            update: {},
            create: ct,
        });
        contentTypes.push(created);
    }
    console.log(`✅ ${contentTypes.length} Content Types seeded`);
    // 5. Contents (Name + linked to Content Type)
    const contentsData = [
        { name: 'فيديو إطلاق المرحلة الأولى للمشروع العقاري', contentTypeId: contentTypes[0].id },
        { name: 'ريلز عرض التخفيضات الأسبوعية 30%', contentTypeId: contentTypes[1].id },
        { name: 'بانر تسويق خدمات الفحص الطبي الشامل', contentTypeId: contentTypes[2].id },
        { name: 'كاروسيل شروحات ومميزات وجبات العائلة', contentTypeId: contentTypes[3].id },
        { name: 'حملة تسجيل الطلاب للعام الأكاديمي الجديد', contentTypeId: contentTypes[4].id },
        { name: 'ريلز قبل وبعد التجديدات', contentTypeId: contentTypes[1].id },
    ];
    const contents = [];
    for (const cnt of contentsData) {
        const existing = await prisma.mediaContent.findFirst({
            where: { name: cnt.name, contentTypeId: cnt.contentTypeId },
        });
        if (!existing) {
            const created = await prisma.mediaContent.create({ data: cnt });
            contents.push(created);
        }
        else {
            contents.push(existing);
        }
    }
    console.log(`✅ ${contents.length} Contents seeded`);
    // 6. Media Records (Campaigns linking Client, Supplier, Channel, Content, Month, Cost)
    const sampleRecords = [
        {
            title: 'حملة الوعي بالعلامة التجارية - الربع الأول',
            clientId: clients[0].id,
            supplierId: suppliers[0].id,
            channelId: channels[0].id,
            contentId: contents[0].id,
            month: 'يناير 2026',
            cost: 28500,
            notes: 'استهداف رجال الأعمال والمهتمين بالعقارات في التجمع والشيخ زايد',
            status: 'COMPLETED',
        },
        {
            title: 'حملة جذب العملاء المحتملين (Lead Generation)',
            clientId: clients[0].id,
            supplierId: suppliers[1].id,
            channelId: channels[2].id,
            contentId: contents[0].id,
            month: 'يناير 2026',
            cost: 34000,
            notes: 'إعلانات بحث جوجل لكلمات مفتاحية شقق للبيع وفيلات',
            status: 'COMPLETED',
        },
        {
            title: 'حملة العروض الصيفية والخصومات',
            clientId: clients[2].id,
            supplierId: suppliers[2].id,
            channelId: channels[4].id,
            contentId: contents[1].id,
            month: 'فبراير 2026',
            cost: 15000,
            notes: 'فيديوهات ريلز وتيك توك سريعة مع فود بلوجرز',
            status: 'ACTIVE',
        },
        {
            title: 'حملة التوعية الصحية الأسرية',
            clientId: clients[1].id,
            supplierId: suppliers[0].id,
            channelId: channels[1].id,
            contentId: contents[2].id,
            month: 'فبراير 2026',
            cost: 19500,
            notes: 'انستجرام كاروسيل وبوستات توعوية بأهمية الفحص السنوي',
            status: 'ACTIVE',
        },
        {
            title: 'حملة القبول المبكر للمدارس',
            clientId: clients[3].id,
            supplierId: suppliers[0].id,
            channelId: channels[0].id,
            contentId: contents[4].id,
            month: 'مارس 2026',
            cost: 22000,
            notes: 'استهداف أولياء الأمور في محيط المعادي والشروق',
            status: 'PLANNED',
        },
        {
            title: 'حملة إعلانات الفيديو على يوتيوب',
            clientId: clients[2].id,
            supplierId: suppliers[1].id,
            channelId: channels[3].id,
            contentId: contents[3].id,
            month: 'مارس 2026',
            cost: 18000,
            notes: 'إعلانات ما قبل المشاهدة غير قابلة للتخطي 15 ثانية',
            status: 'PLANNED',
        },
    ];
    await prisma.mediaRecord.deleteMany({});
    for (const r of sampleRecords) {
        await prisma.mediaRecord.create({ data: r });
    }
    console.log(`✅ ${sampleRecords.length} Media Records seeded successfully`);
    console.log('--- Media Seed Finished ---');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
