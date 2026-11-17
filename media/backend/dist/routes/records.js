import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma/prismaClient.js';
import { requireWritePermission } from '../middleware/auth.js';
const router = Router();
const recordSchema = z.object({
    title: z.string().optional(),
    clientId: z.string().uuid('معرف العميل غير صالح'),
    supplierId: z.string().uuid('معرف المورد غير صالح'),
    channelId: z.string().uuid('معرف القناة غير صالح'),
    contentId: z.string().uuid('معرف المحتوى غير صالح'),
    month: z.string().min(1, 'الشهر مطلوب'),
    cost: z.number().nonnegative().default(0),
    netToChannel: z.number().nonnegative().default(0),
    netToClient: z.number().nonnegative().default(0),
    notes: z.string().optional(),
    status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'INVOICED']).default('PLANNED'),
});
// Helper: Escape CSV fields
function escapeCsv(field) {
    if (field === null || field === undefined)
        return '';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
}
export const STANDARD_MONTHS = [
    'يناير 2026',
    'فبراير 2026',
    'مارس 2026',
    'أبريل 2026',
    'مايو 2026',
    'يونيو 2026',
    'يوليو 2026',
    'أغسطس 2026',
    'سبتمبر 2026',
    'أكتوبر 2026',
    'نوفمبر 2026',
    'ديسمبر 2026',
];
const MONTH_NAMES_MAP = {
    'يناير': 1, 'jan': 1, 'january': 1, '1': 1, '01': 1,
    'فبراير': 2, 'feb': 2, 'february': 2, '2': 2, '02': 2,
    'مارس': 3, 'mar': 3, 'march': 3, '3': 3, '03': 3,
    'أبريل': 4, 'ابريل': 4, 'apr': 4, 'april': 4, '4': 4, '04': 4,
    'مايو': 5, 'may': 5, '5': 5, '05': 5,
    'يونيو': 6, 'jun': 6, 'june': 6, '6': 6, '06': 6,
    'يوليو': 7, 'jul': 7, 'july': 7, '7': 7, '07': 7,
    'أغسطس': 8, 'اغسطس': 8, 'aug': 8, 'august': 8, '8': 8, '08': 8,
    'سبتمبر': 9, 'sep': 9, 'september': 9, '9': 9, '09': 9,
    'أكتوبر': 10, 'اكتوبر': 10, 'oct': 10, 'october': 10, '10': 10,
    'نوفمبر': 11, 'nov': 11, 'november': 11, '11': 11,
    'ديسمبر': 12, 'dec': 12, 'december': 12, '12': 12,
};
export function parseMonthSortKey(monthStr) {
    if (!monthStr)
        return 0;
    const s = String(monthStr).trim().toLowerCase();
    const yearMatch = s.match(/(20\d\d)/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
    let monthNum = 1;
    for (const [key, val] of Object.entries(MONTH_NAMES_MAP)) {
        if (s.includes(key)) {
            monthNum = val;
            break;
        }
    }
    return year * 100 + monthNum;
}
// 1. Download CSV Template (With EXACT columns in order)
// Client | supplier | Channel | Content | Content Type | Month | Net to Channel | Net to Client | Notes
router.get('/template', (req, res) => {
    const headers = [
        'Client',
        'supplier',
        'Channel',
        'Content',
        'Content Type',
        'Month',
        'Net to Channel',
        'Net to Client',
        'Notes',
    ];
    const sampleRows = [
        [
            'شركة النيل للاستثمار العقاري',
            'Meta Platforms (Facebook & Instagram Ads)',
            'Facebook',
            'فيديو إطلاق المرحلة الأولى للمشروع العقاري',
            'فيديو إعلاني سينمائي (Commercial Video)',
            'يناير 2026',
            '25000',
            '32000',
            'حملة مستهدفة للتجمع والشيخ زايد',
        ],
        [
            'مطاعم برجر شوب مصر',
            'TikTok Ads MENA',
            'TikTok',
            'ريلز عرض التخفيضات الأسبوعية 30%',
            'ريلز ومقاطع قصيرة (Reels & Shorts)',
            'فبراير 2026',
            '12000',
            '16500',
            'فيديوهات ريلز مع فود بلوجرز',
        ],
    ];
    const csvContent = '\uFEFF' + // UTF-8 BOM for Arabic support in Excel
        headers.join(',') +
        '\n' +
        sampleRows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="OMS_Media_Template.csv"');
    res.send(csvContent);
});
// 2. Export Data (With EXACT columns in order)
router.get('/export', async (req, res) => {
    try {
        const { search, clientId, supplierId, channelId, contentId, month, months, fromMonth, toMonth, status } = req.query;
        const where = {};
        if (clientId && typeof clientId === 'string' && clientId !== 'ALL')
            where.clientId = clientId;
        if (supplierId && typeof supplierId === 'string' && supplierId !== 'ALL')
            where.supplierId = supplierId;
        if (channelId && typeof channelId === 'string' && channelId !== 'ALL')
            where.channelId = channelId;
        if (contentId && typeof contentId === 'string' && contentId !== 'ALL')
            where.contentId = contentId;
        if (status && typeof status === 'string' && status !== 'ALL')
            where.status = status;
        // Multi-select months filter
        let selectedMonthsList = [];
        if (Array.isArray(months)) {
            selectedMonthsList = months.map(String).map((m) => m.trim()).filter(Boolean);
        }
        else if (typeof months === 'string' && months.trim() !== '') {
            selectedMonthsList = months.split(',').map((m) => m.trim()).filter(Boolean);
        }
        if (selectedMonthsList.length > 0) {
            where.month = { in: selectedMonthsList };
        }
        else if (month && typeof month === 'string' && month !== 'ALL') {
            where.month = month;
        }
        if (search && typeof search === 'string' && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { notes: { contains: q, mode: 'insensitive' } },
                { client: { name: { contains: q, mode: 'insensitive' } } },
                { supplier: { name: { contains: q, mode: 'insensitive' } } },
                { channel: { name: { contains: q, mode: 'insensitive' } } },
                { content: { name: { contains: q, mode: 'insensitive' } } },
                { month: { contains: q, mode: 'insensitive' } },
            ];
        }
        let records = await prisma.mediaRecord.findMany({
            where,
            include: {
                client: true,
                supplier: true,
                channel: true,
                content: { include: { contentType: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Month Range filter (من شهر كذا إلى شهر كذا)
        if (fromMonth || toMonth) {
            const fromKey = fromMonth && typeof fromMonth === 'string' && fromMonth !== 'ALL' ? parseMonthSortKey(fromMonth) : -Infinity;
            const toKey = toMonth && typeof toMonth === 'string' && toMonth !== 'ALL' ? parseMonthSortKey(toMonth) : Infinity;
            records = records.filter((r) => {
                const rKey = parseMonthSortKey(r.month);
                return rKey >= fromKey && rKey <= toKey;
            });
        }
        const headers = [
            'Client',
            'supplier',
            'Channel',
            'Content',
            'Content Type',
            'Month',
            'Net to Channel',
            'Net to Client',
            'Notes',
        ];
        const rows = records.map((r) => [
            escapeCsv(r.client?.name || ''),
            escapeCsv(r.supplier?.name || ''),
            escapeCsv(r.channel?.name || ''),
            escapeCsv(r.content?.name || ''),
            escapeCsv(r.content?.contentType?.name || ''),
            escapeCsv(r.month || ''),
            escapeCsv(Number(r.netToChannel || 0)),
            escapeCsv(Number(r.netToClient || r.cost || 0)),
            escapeCsv(r.notes || ''),
        ]);
        const csvContent = '\uFEFF' + // UTF-8 BOM for Arabic in Excel
            headers.join(',') +
            '\n' +
            rows.map((row) => row.join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="OMS_Media_Export.csv"');
        res.send(csvContent);
    }
    catch (error) {
        console.error('export error:', error);
        res.status(500).json({ success: false, message: 'خطأ أثناء تصدير البيانات' });
    }
});
// 3. Import Data (Parse CSV / JSON rows with EXACT columns in order)
router.post('/import', requireWritePermission, async (req, res) => {
    try {
        const { rows } = req.body;
        if (!Array.isArray(rows) || rows.length === 0) {
            res.status(400).json({ success: false, message: 'لم يتم العثور على أي صفوف صالحة للاستيراد' });
            return;
        }
        let createdCount = 0;
        let errorsList = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // Expected keys: Client, supplier, Channel, Content, Content Type, Month, Net to Channel, Net to Client, Notes
            const clientName = (row['Client'] || row['client'] || '').trim();
            const supplierName = (row['supplier'] || row['Supplier'] || '').trim();
            const channelName = (row['Channel'] || row['channel'] || '').trim();
            const contentName = (row['Content'] || row['content'] || '').trim();
            const contentTypeName = (row['Content Type'] || row['content_type'] || row['contentType'] || 'عام').trim();
            const month = (row['Month'] || row['month'] || 'غير محدد').trim();
            const netToChannel = parseFloat(String(row['Net to Channel'] || row['netToChannel'] || 0)) || 0;
            const netToClient = parseFloat(String(row['Net to Client'] || row['netToClient'] || 0)) || 0;
            const notes = (row['Notes'] || row['notes'] || '').trim();
            if (!clientName || !supplierName || !channelName || !contentName) {
                errorsList.push(`الصف رقم ${i + 1}: ينقصه بيانات أساسية (Client, Supplier, Channel, أو Content)`);
                continue;
            }
            // Upsert Client in Media
            const client = await prisma.mediaClient.upsert({
                where: { name: clientName },
                update: {},
                create: { name: clientName },
            });
            // Automatically sync Client into Accounting department (public.clients)
            try {
                const existingInAcc = await prisma.$queryRaw `
          SELECT id FROM "public"."clients" WHERE "name" = ${clientName} LIMIT 1
        `;
                if (existingInAcc.length === 0) {
                    const newAccId = (await import('crypto')).randomUUID();
                    await prisma.$executeRaw `
            INSERT INTO "public"."clients" ("id", "name", "companyName", "notes", "isActive", "createdAt", "updatedAt")
            VALUES (${newAccId}, ${clientName}, ${clientName}, 'عميل مستورد عبر ميديا', true, NOW(), NOW())
          `;
                }
            }
            catch (err) {
                console.error('Accounting client sync error during import:', err);
            }
            // Upsert Supplier
            const supplier = await prisma.mediaSupplier.upsert({
                where: { name: supplierName },
                update: {},
                create: { name: supplierName },
            });
            // Upsert Channel
            const channel = await prisma.mediaChannel.upsert({
                where: { name: channelName },
                update: {},
                create: { name: channelName },
            });
            // Upsert Content Type
            const ct = await prisma.mediaContentType.upsert({
                where: { name: contentTypeName || 'عام' },
                update: {},
                create: { name: contentTypeName || 'عام' },
            });
            // Upsert Content
            let content = await prisma.mediaContent.findFirst({
                where: { name: contentName, contentTypeId: ct.id },
            });
            if (!content) {
                content = await prisma.mediaContent.create({
                    data: { name: contentName, contentTypeId: ct.id },
                });
            }
            // Create Media Record
            await prisma.mediaRecord.create({
                data: {
                    title: `${contentName} - ${channelName}`,
                    clientId: client.id,
                    supplierId: supplier.id,
                    channelId: channel.id,
                    contentId: content.id,
                    month,
                    cost: netToClient > 0 ? netToClient : netToChannel,
                    netToChannel,
                    netToClient,
                    notes,
                    status: 'PLANNED',
                },
            });
            createdCount++;
        }
        res.json({
            success: true,
            message: `تم استيراد ${createdCount} حملة وسجل بنجاح!`,
            data: {
                importedCount: createdCount,
                errors: errorsList,
            },
        });
    }
    catch (error) {
        console.error('import error:', error);
        res.status(500).json({ success: false, message: 'خطأ أثناء استيراد البيانات' });
    }
});
// List records with search & Kaggle-style filters
router.get('/', async (req, res) => {
    try {
        const { search, clientId, supplierId, channelId, contentId, month, months, fromMonth, toMonth, status } = req.query;
        const where = {};
        if (clientId && typeof clientId === 'string' && clientId !== 'ALL') {
            where.clientId = clientId;
        }
        if (supplierId && typeof supplierId === 'string' && supplierId !== 'ALL') {
            where.supplierId = supplierId;
        }
        if (channelId && typeof channelId === 'string' && channelId !== 'ALL') {
            where.channelId = channelId;
        }
        if (contentId && typeof contentId === 'string' && contentId !== 'ALL') {
            where.contentId = contentId;
        }
        if (status && typeof status === 'string' && status !== 'ALL') {
            where.status = status;
        }
        // Multi-select months filter
        let selectedMonthsList = [];
        if (Array.isArray(months)) {
            selectedMonthsList = months.map(String).map((m) => m.trim()).filter(Boolean);
        }
        else if (typeof months === 'string' && months.trim() !== '') {
            selectedMonthsList = months.split(',').map((m) => m.trim()).filter(Boolean);
        }
        if (selectedMonthsList.length > 0) {
            where.month = { in: selectedMonthsList };
        }
        else if (month && typeof month === 'string' && month !== 'ALL') {
            where.month = month;
        }
        if (search && typeof search === 'string' && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { notes: { contains: q, mode: 'insensitive' } },
                { client: { name: { contains: q, mode: 'insensitive' } } },
                { supplier: { name: { contains: q, mode: 'insensitive' } } },
                { channel: { name: { contains: q, mode: 'insensitive' } } },
                { content: { name: { contains: q, mode: 'insensitive' } } },
                { month: { contains: q, mode: 'insensitive' } },
            ];
        }
        let records = await prisma.mediaRecord.findMany({
            where,
            include: {
                client: true,
                supplier: true,
                channel: true,
                content: {
                    include: { contentType: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Month Range filter (من شهر كذا إلى شهر كذا)
        if (fromMonth || toMonth) {
            const fromKey = fromMonth && typeof fromMonth === 'string' && fromMonth !== 'ALL' ? parseMonthSortKey(fromMonth) : -Infinity;
            const toKey = toMonth && typeof toMonth === 'string' && toMonth !== 'ALL' ? parseMonthSortKey(toMonth) : Infinity;
            records = records.filter((r) => {
                const rKey = parseMonthSortKey(r.month);
                return rKey >= fromKey && rKey <= toKey;
            });
        }
        res.json({ success: true, data: records });
    }
    catch (error) {
        console.error('getRecords error:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب سجلات الميديا' });
    }
});
// Get filter facets (values available for Kaggle-style filter menu)
router.get('/filter-facets', async (req, res) => {
    try {
        const [clients, suppliers, channels, contents, monthsList] = await Promise.all([
            prisma.mediaClient.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
            prisma.mediaSupplier.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
            prisma.mediaChannel.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
            prisma.mediaContent.findMany({
                select: { id: true, name: true, contentType: { select: { name: true } } },
                orderBy: { name: 'asc' },
            }),
            prisma.mediaRecord.findMany({
                select: { month: true },
                distinct: ['month'],
            }),
        ]);
        const distinctDbMonths = monthsList.map((m) => m.month).filter(Boolean);
        const combinedMonths = Array.from(new Set([...STANDARD_MONTHS, ...distinctDbMonths]));
        combinedMonths.sort((a, b) => parseMonthSortKey(a) - parseMonthSortKey(b));
        res.json({
            success: true,
            data: {
                clients,
                suppliers,
                channels,
                contents,
                months: combinedMonths,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب خيارات الفلاتر' });
    }
});
// Get single record
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const record = await prisma.mediaRecord.findUnique({
            where: { id },
            include: {
                client: true,
                supplier: true,
                channel: true,
                content: { include: { contentType: true } },
            },
        });
        if (!record) {
            res.status(404).json({ success: false, message: 'السجل غير موجود' });
            return;
        }
        res.json({ success: true, data: record });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب بيانات السجل' });
    }
});
// Create record
router.post('/', requireWritePermission, async (req, res) => {
    try {
        const parsed = recordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.errors });
            return;
        }
        const data = parsed.data;
        const cost = data.netToClient > 0 ? data.netToClient : data.cost;
        const record = await prisma.mediaRecord.create({
            data: {
                ...data,
                cost,
            },
            include: {
                client: true,
                supplier: true,
                channel: true,
                content: { include: { contentType: true } },
            },
        });
        res.status(201).json({ success: true, data: record, message: 'تم حفظ حملة الميديا بنجاح' });
    }
    catch (error) {
        console.error('createRecord error:', error);
        res.status(500).json({ success: false, message: 'خطأ أثناء إنشاء سجل الميديا' });
    }
});
// Update record
router.put('/:id', requireWritePermission, async (req, res) => {
    try {
        const { id } = req.params;
        const parsed = recordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, errors: parsed.error.errors });
            return;
        }
        const data = parsed.data;
        const cost = data.netToClient > 0 ? data.netToClient : data.cost;
        const updated = await prisma.mediaRecord.update({
            where: { id },
            data: {
                ...data,
                cost,
            },
            include: {
                client: true,
                supplier: true,
                channel: true,
                content: { include: { contentType: true } },
            },
        });
        res.json({ success: true, data: updated, message: 'تم تحديث سجل الميديا بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ أثناء تحديث سجل الميديا' });
    }
});
// Delete record
router.delete('/:id', requireWritePermission, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.mediaRecord.delete({ where: { id } });
        res.json({ success: true, message: 'تم حذف السجل بنجاح' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'خطأ أثناء حذف السجل' });
    }
});
export default router;
