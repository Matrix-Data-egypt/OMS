
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_SERVICE_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    'Missing SUPABASE_URL environment variable. Check Vercel Environment Variables.'
  );
}

if (!supabaseKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_KEY environment variable. Check Vercel Environment Variables.'
  );
}

try {
  const parsedUrl = new URL(supabaseUrl);

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Invalid URL protocol');
  }
} catch {
  throw new Error(
    'Invalid SUPABASE_URL. Expected a valid HTTP or HTTPS URL.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

// ==========================================
// DATABASE TABLE MAPPING
// ==========================================

const tableMap: Record<string, string> = {
  user: 'users',
  client: 'clients',
  service: 'services',
  approvalRule: 'approval_rules',
  invoice: 'invoices',
  invoiceItem: 'invoice_items',
  invoiceTax: 'invoice_taxes',
  approvalStep: 'approval_steps',
  payment: 'payments',
  deliveryLog: 'delivery_logs',
  auditLog: 'audit_logs',
};

// ==========================================
// UUID GENERATOR
// ==========================================

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
}

// ==========================================
// WHERE CONDITION HANDLER
// ==========================================

function applyWhere(query: any, where: any) {
  if (!where) return query;

  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;

    if (key === 'OR' && Array.isArray(val)) {
      const orParts = val
        .map((cond: any) =>
          Object.entries(cond)
            .map(([k, v]: [string, any]) => {
              if (
                typeof v === 'object' &&
                v !== null &&
                'contains' in v
              ) {
                return `${k}.ilike.%${v.contains}%`;
              }

              return `${k}.eq.${v}`;
            })
            .join(',')
        )
        .join(',');

      if (orParts) {
        query = query.or(orParts);
      }
    } else if (
      typeof val === 'object' &&
      val !== null &&
      !Array.isArray(val)
    ) {
      if ('contains' in val) {
        query = query.ilike(
          key,
          `%${(val as any).contains}%`
        );
      } else if ('in' in val) {
        query = query.in(key, (val as any).in);
      } else if ('gte' in val) {
        query = query.gte(key, (val as any).gte);
      } else if ('lte' in val) {
        query = query.lte(key, (val as any).lte);
      }
    } else {
      query = query.eq(key, val);
    }
  }

  return query;
}

// ==========================================
// MODEL PROXY
// ==========================================

function createModelProxy(tableName: string) {
  return {
    async findUnique({ where }: any) {
      let query = supabase
        .from(tableName)
        .select('*');

      query = applyWhere(query, where);

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error(
          `[Supabase findUnique] Table: ${tableName}`,
          error
        );
        throw new Error(error.message);
      }

      return data;
    },

    async findFirst({ where, orderBy }: any = {}) {
      let query = supabase
        .from(tableName)
        .select('*');

      query = applyWhere(query, where);

      if (orderBy) {
        const [col, dir] = Object.entries(orderBy)[0];

        query = query.order(col, {
          ascending: dir === 'asc',
        });
      }

      const { data, error } = await query
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          `[Supabase findFirst] Table: ${tableName}`,
          error
        );
        throw new Error(error.message);
      }

      return data;
    },

    async findMany({ where, orderBy, take, skip }: any = {}) {
      let query = supabase
        .from(tableName)
        .select('*');

      query = applyWhere(query, where);

      if (orderBy) {
        const [col, dir] = Object.entries(orderBy)[0];

        query = query.order(col, {
          ascending: dir === 'asc',
        });
      }

      if (take !== undefined) {
        query = query.limit(take);
      }

      if (skip !== undefined && skip > 0) {
        const limit = take || 100;

        query = query.range(
          skip,
          skip + limit - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error(
          `[Supabase findMany] Table: ${tableName}`,
          error
        );
        throw new Error(error.message);
      }

      return data || [];
    },

    async create({ data }: any) {
      const payload = {
        id: generateUUID(),
        ...data,
      };

      const { data: created, error } = await supabase
        .from(tableName)
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error(
          `[Supabase create] Table: ${tableName}`,
          error
        );
        throw new Error(error.message);
      }

      return created;
    },

    async update({ where, data }: any) {
      let query = supabase
        .from(tableName)
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        });

      query = applyWhere(query, where);

      const { data: updated, error } = await query
        .select()
        .single();

      if (error) {
        console.error(
          `[Supabase update] Table: ${tableName}`,
          error
        );
        throw new Error(error.message);
      }

      return updated;
    },

    async upsert({ where, create, update }: any) {
      const existing = await this.findUnique({ where });

      if (existing) {
        return this.update({
          where,
          data: update,
        });
      }

      return this.create({
        data: create,
      });
    },

    async delete({ where }: any) {
      let query = supabase
        .from(tableName)
        .delete();

      query = applyWhere(query, where);

      const { data, error } = await query
        .select()
        .single();

      if (error) {
        console.error(
          `[Supabase delete] Table: ${tableName}`,
          error
        );
        throw new Error(error.message);
      }

      return data;
    },

    async deleteMany({ where }: any = {}) {
      let query = supabase
        .from(tableName)
        .delete();

      query = applyWhere(query, where);

      const { error, count } = await query;

      if (error) {
        console.error(
          `[Supabase deleteMany] Table: ${tableName}`,
          error
        );
        throw new Error(error.message);
      }

      return {
        count: count || 0,
      };
    },

    async count({ where }: any = {}) {
      let query = supabase
        .from(tableName)
        .select('*', {
          count: 'exact',
          head: true,
        });

      query = applyWhere(query, where);

      const { count, error } = await query;

      if (error) {
        console.error(
          `[Supabase count] Table: ${tableName}`,
          error
        );
        throw new Error(error.message);
      }

      return count || 0;
    },
  };
}

// ==========================================
// PRISMA COMPATIBILITY PROXY
// ==========================================

const prisma: any = new Proxy(
  {},
  {
    get(target, prop: string) {
      if (prop === '$transaction') {
        return async (arg: any) => {
          if (typeof arg === 'function') {
            return arg(prisma);
          }

          return Promise.all(arg);
        };
      }

      if (
        prop === '$disconnect' ||
        prop === '$connect'
      ) {
        return async () => {};
      }

      if (tableMap[prop]) {
        return createModelProxy(tableMap[prop]);
      }

      return (target as any)[prop];
    },
  }
);

export default prisma;
export { prisma };
