
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prismaClient.js';
import { requireWritePermission } from '../middleware/auth.js';

const router = Router();

/**
 * Read-only media access middleware.
 * Authenticates the user and checks current database permissions.
 * Unlike requireWritePermission, this allows read-only users.
 */
async function requireMediaAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'يجب تسجيل الدخول أولاً',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'رمز الدخول غير موجود',
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: 'إعدادات المصادقة غير مكتملة',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded.id || typeof decoded.id !== 'string') {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح',
      });
      return;
    }

    const users = await prisma.$queryRaw<any[]>`
      SELECT id, name, username, role, "systemAccess", "isActive"
      FROM "public"."users"
      WHERE id = ${decoded.id}
      LIMIT 1
    `;

    if (!users || users.length === 0 || !users[0].isActive) {
      res.status(403).json({
        success: false,
        message: 'المستخدم غير موجود أو غير مفعّل',
      });
      return;
    }

    const user = users[0];

    const hasAccess =
      user.role === 'MEDIA_ADMIN'
        ? user.systemAccess === 'MEDIA'
        : ['MEDIA', 'ALL'].includes(user.systemAccess);

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالدخول إلى نظام الميديا',
      });
      return;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'رمز الدخول غير صالح أو منتهي',
      });
      return;
    }

    console.error('Media read authorization error:', error);

    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من الصلاحيات',
    });
  }
}

const recordSchema = z.object({
  title: z.string().optional(),
  clientId: z.string().uuid('معرف العميل غير صالح'),
  supplierId: z.string().uuid('معرف المورد غير صالح'),
  channelId: z.string().uuid('معرف القناة غير صالح'),
  contentId: z.string().uuid('معرف المحتوى غير صالح'),
  month: z.string().min(1, 'الشهر مطلوب'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  cost: z.number().nonnegative().default(0),
  netToChannel: z.number().nonnegative().default(0),
  netToClient: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  status: z.enum([
    'PLANNED',
    'ACTIVE',
    'COMPLETED',
    'INVOICED',
  ]).default('PLANNED'),
});

// Escape CSV fields
function escapeCsv(field: any): string {
  if (field === null || field === undefined) return '';

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

const MONTH_NAMES_MAP: Record<string, number> = {
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

export function parseMonthSortKey(monthStr: string): number {
  if (!monthStr) return 0;

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

// Shared record filters
function buildRecordWhere(query: Request['query']): any {
  const {
    search,
    clientId,
    supplierId,
    channelId,
    contentId,
    month,
    months,
    status,
  } = query;

  const where: any = {};

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

  let selectedMonthsList: string[] = [];

  if (Array.isArray(months)) {
    selectedMonthsList = months
      .map(String)
      .map((m) => m.trim())
      .filter(Boolean);
  } else if (typeof months === 'string' && months.trim() !== '') {
    selectedMonthsList = months
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
  }

  if (selectedMonthsList.length > 0) {
    where.month = { in: selectedMonthsList };
  } else if (
    month &&
    typeof month === 'string' &&
    month !== 'ALL'
  ) {
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

  return where;
}

// Apply month range filter
function applyMonthRange(
  records: any[],
  fromMonth: unknown,
  toMonth: unknown
): any[] {
  if (!fromMonth && !toMonth) {
    return records;
  }

  const fromKey =
    fromMonth &&
    typeof fromMonth === 'string' &&
    fromMonth !== 'ALL'
      ? parseMonthSortKey(fromMonth)
      : -Infinity;

  const toKey =
    toMonth &&
    typeof toMonth === 'string' &&
    toMonth !== 'ALL'
      ? parseMonthSortKey(toMonth)
      : Infinity;

  return records.filter((record) => {
    const recordKey = parseMonthSortKey(record.month);

    return recordKey >= fromKey && recordKey <= toKey;
  });
}

const recordInclude = {
  client: true,
  supplier: true,
  channel: true,
  content: {
    include: {
      contentType: true,
    },
  },
};

// 1. Download CSV Template
router.get(
  '/template',
  requireMediaAccess,
  (req: Request, res: Response) => {
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

    const csvContent =
      '\uFEFF' +
      headers.join(',') +
      '\n' +
      sampleRows
        .map((row) => row.map(escapeCsv).join(','))
        .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="OMS_Media_Template.csv"'
    );

    res.send(csvContent);
  }
);

// 2. Export Data
router.get(
  '/export',
  requireMediaAccess,
  async (req: Request, res: Response) => {
    try {
      const where = buildRecordWhere(req.query);

      let records = await prisma.mediaRecord.findMany({
        where,
        include: recordInclude,
        orderBy: { createdAt: 'desc' },
      });

      records = applyMonthRange(
        records,
        req.query.fromMonth,
        req.query.toMonth
      );

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

      const rows = records.map((record) => [
        escapeCsv(record.client?.name || ''),
        escapeCsv(record.supplier?.name || ''),
        escapeCsv(record.channel?.name || ''),
        escapeCsv(record.content?.name || ''),
        escapeCsv(record.content?.contentType?.name || ''),
        escapeCsv(record.month || ''),
        escapeCsv(Number(record.netToChannel || 0)),
        escapeCsv(Number(record.netToClient || record.cost || 0)),
        escapeCsv(record.notes || ''),
      ]);

      const csvContent =
        '\uFEFF' +
        headers.join(',') +
        '\n' +
        rows.map((row) => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="OMS_Media_Export.csv"'
      );

      res.send(csvContent);
    } catch (error) {
      console.error('export error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء تصدير البيانات',
      });
    }
  }
);

// 3. Import Data
router.post(
  '/import',
  requireWritePermission,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { rows } = req.body;

      if (!Array.isArray(rows) || rows.length === 0) {
        res.status(400).json({
          success: false,
          message: 'لم يتم العثور على أي صفوف صالحة للاستيراد',
        });
        return;
      }

      let createdCount = 0;
      const errorsList: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        if (!row || typeof row !== 'object' || Array.isArray(row)) {
          errorsList.push(`الصف رقم ${i + 1}: تنسيق الصف غير صالح`);
          continue;
        }

        const clientName = String(
          row['Client'] || row['client'] || ''
        ).trim();

        const supplierName = String(
          row['supplier'] || row['Supplier'] || ''
        ).trim();

        const channelName = String(
          row['Channel'] || row['channel'] || ''
        ).trim();

        const contentName = String(
          row['Content'] || row['content'] || ''
        ).trim();

        const contentTypeName = String(
          row['Content Type'] ||
          row['content_type'] ||
          row['contentType'] ||
          'عام'
        ).trim();

        const month = String(
          row['Month'] || row['month'] || 'غير محدد'
        ).trim();

        const netToChannel =
          parseFloat(
            String(row['Net to Channel'] || row['netToChannel'] || 0)
          ) || 0;

        const netToClient =
          parseFloat(
            String(row['Net to Client'] || row['netToClient'] || 0)
          ) || 0;

        const notes = String(
          row['Notes'] || row['notes'] || ''
        ).trim();

        if (
          !clientName ||
          !supplierName ||
          !channelName ||
          !contentName
        ) {
          errorsList.push(
            `الصف رقم ${i + 1}: ينقصه بيانات أساسية (Client, Supplier, Channel, أو Content)`
          );
          continue;
        }

        if (
          !Number.isFinite(netToChannel) ||
          !Number.isFinite(netToClient) ||
          netToChannel < 0 ||
          netToClient < 0
        ) {
          errorsList.push(
            `الصف رقم ${i + 1}: قيمة مالية غير صالحة`
          );
          continue;
        }

        try {
          // Create or find Media Client.
          // No writes are made to Invoice / Accounting tables.
          const client = await prisma.mediaClient.upsert({
            where: { name: clientName },
            update: {},
            create: { name: clientName },
          });

          const supplier = await prisma.mediaSupplier.upsert({
            where: { name: supplierName },
            update: {},
            create: { name: supplierName },
          });

          const channel = await prisma.mediaChannel.upsert({
            where: { name: channelName },
            update: {},
            create: { name: channelName },
          });

          const contentType = await prisma.mediaContentType.upsert({
            where: { name: contentTypeName || 'عام' },
            update: {},
            create: { name: contentTypeName || 'عام' },
          });

          let content = await prisma.mediaContent.findFirst({
            where: {
              name: contentName,
              contentTypeId: contentType.id,
            },
          });

          if (!content) {
            content = await prisma.mediaContent.create({
              data: {
                name: contentName,
                contentTypeId: contentType.id,
              },
            });
          }

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
        } catch (rowError) {
          console.error(`Import row ${i + 1} error:`, rowError);

          errorsList.push(
            `الصف رقم ${i + 1}: حدث خطأ أثناء حفظ البيانات`
          );
        }
      }

      res.json({
        success: true,
        message: `تم استيراد ${createdCount} حملة وسجل بنجاح!`,
        data: {
          importedCount: createdCount,
          errors: errorsList,
        },
      });
    } catch (error) {
      console.error('import error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء استيراد البيانات',
      });
    }
  }
);

// 4. List Records
router.get(
  '/',
  requireMediaAccess,
  async (req: Request, res: Response) => {
    try {
      const where = buildRecordWhere(req.query);

      let records = await prisma.mediaRecord.findMany({
        where,
        include: recordInclude,
        orderBy: { createdAt: 'desc' },
      });

      records = applyMonthRange(
        records,
        req.query.fromMonth,
        req.query.toMonth
      );

      res.json({
        success: true,
        data: records,
      });
    } catch (error) {
      console.error('getRecords error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ في جلب سجلات الميديا',
      });
    }
  }
);

// 5. Get Filter Facets
router.get(
  '/filter-facets',
  requireMediaAccess,
  async (req: Request, res: Response) => {
    try {
      const [
        clients,
        suppliers,
        channels,
        contents,
        monthsList,
      ] = await Promise.all([
        prisma.mediaClient.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),

        prisma.mediaSupplier.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),

        prisma.mediaChannel.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),

        prisma.mediaContent.findMany({
          select: {
            id: true,
            name: true,
            contentType: {
              select: { name: true },
            },
          },
          orderBy: { name: 'asc' },
        }),

        prisma.mediaRecord.findMany({
          select: { month: true },
          distinct: ['month'],
        }),
      ]);

      const distinctDbMonths = monthsList
        .map((item) => item.month)
        .filter(Boolean);

      const combinedMonths = Array.from(
        new Set([...STANDARD_MONTHS, ...distinctDbMonths])
      );

      combinedMonths.sort(
        (a, b) => parseMonthSortKey(a) - parseMonthSortKey(b)
      );

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
    } catch (error) {
      console.error('filter facets error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ في جلب خيارات الفلاتر',
      });
    }
  }
);

// 6. Get Single Record
router.get(
  '/:id',
  requireMediaAccess,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const record = await prisma.mediaRecord.findUnique({
        where: { id },
        include: recordInclude,
      });

      if (!record) {
        res.status(404).json({
          success: false,
          message: 'السجل غير موجود',
        });
        return;
      }

      res.json({
        success: true,
        data: record,
      });
    } catch (error) {
      console.error('getSingleRecord error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ في جلب بيانات السجل',
      });
    }
  }
);

// 7. Create Record
router.post(
  '/',
  requireWritePermission,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = recordSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          errors: parsed.error.errors,
        });
        return;
      }

      const { startDate, endDate, ...data } = parsed.data;
      const cost =
        data.netToClient > 0 ? data.netToClient : data.cost;

      const recordNotes = [
        data.notes,
        startDate && endDate ? `تاريخ الحملة: من ${startDate} إلى ${endDate}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const record = await prisma.mediaRecord.create({
        data: {
          ...data,
          notes: recordNotes || undefined,
          cost,
        },
        include: recordInclude,
      });

      res.status(201).json({
        success: true,
        data: record,
        message: 'تم حفظ حملة الميديا بنجاح',
      });
    } catch (error) {
      console.error('createRecord error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء إنشاء سجل الميديا',
      });
    }
  }
);

// 8. Update Record
router.put(
  '/:id',
  requireWritePermission,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const parsed = recordSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          errors: parsed.error.errors,
        });
        return;
      }

      const data = parsed.data;
      const cost =
        data.netToClient > 0 ? data.netToClient : data.cost;

      const updated = await prisma.mediaRecord.update({
        where: { id },
        data: {
          ...data,
          cost,
        },
        include: recordInclude,
      });

      res.json({
        success: true,
        data: updated,
        message: 'تم تحديث سجل الميديا بنجاح',
      });
    } catch (error) {
      console.error('updateRecord error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء تحديث سجل الميديا',
      });
    }
  }
);

// 9. Delete Record
router.delete(
  '/:id',
  requireWritePermission,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.mediaRecord.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'تم حذف السجل بنجاح',
      });
    } catch (error) {
      console.error('deleteRecord error:', error);

      res.status(500).json({
        success: false,
        message: 'خطأ أثناء حذف السجل',
      });
    }
  }
);

export default router;
