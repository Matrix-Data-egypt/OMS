import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import { FinancialOverview, Invoice } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Clock,
  PlusCircle,
  CheckCircle2,
  Users,
  ArrowUpRight,
  FileText,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, hasRole } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [ovRes, invRes] = await Promise.all([
        apiRequest<FinancialOverview>('/reports/overview'),
        apiRequest<Invoice[]>('/invoices'),
      ]);

      if (ovRes.success && ovRes.data) {
        setOverview(ovRes.data);
      }
      if (invRes.success && invRes.data) {
        setRecentInvoices(invRes.data.slice(0, 5));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    DRAFT: { label: 'مسودة', bg: 'bg-neutral-100', text: 'text-neutral-700' },
    PENDING_APPROVAL: { label: 'بانتظار الاعتماد', bg: 'bg-amber-50', text: 'text-amber-700' },
    APPROVED: { label: 'معتمدة', bg: 'bg-blue-50', text: 'text-blue-700' },
    ISSUED: { label: 'مصدرة للعميل', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    PARTIALLY_PAID: { label: 'مسددة جزئياً', bg: 'bg-teal-50', text: 'text-teal-700' },
    PAID: { label: 'مسددة بالكامل', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    CANCELLED: { label: 'ملغاة', bg: 'bg-rose-50', text: 'text-rose-700' },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#171717] via-[#222222] to-[#171717] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-neutral-800">
        <div className="absolute top-0 end-0 -mt-8 -me-8 w-48 h-48 bg-[#DC2626]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
              <span className="text-xs font-bold text-red-400">لوحة المتابعة المالية المباشرة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              مرحباً، {user?.name}
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-xl">
              نظام إدارة فواتير OMS Invoice لتنظيم الإصدار، مراجعة الحدود المالية، والتحصيل بالجنيه المصري.
            </p>
          </div>

          {hasRole(['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT']) && (
            <div className="flex items-center gap-3">
              <Link
                to="/invoices/new"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold shadow-lg shadow-red-900/30 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                <span>فاتورة جديدة</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Billed */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">إجمالي الفواتير الصادرة</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900">
                {formatCurrency(overview.totalBilled)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                نسبة التحصيل: <span className="font-bold text-emerald-600">{overview.collectionRate}%</span>
              </div>
            </div>
          </div>

          {/* Total Collected */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">إجمالي المحصل الفعلي</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">
                {formatCurrency(overview.totalCollected)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {overview.paidCount} فاتورة مسددة بالكامل
              </div>
            </div>
          </div>

          {/* Outstanding Receivables */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500">مستحقات قيد التحصيل</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900">
                {formatCurrency(overview.totalOutstanding)}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                متبقي على عملاء OMS
              </div>
            </div>
          </div>

          {/* Overdue Receivables (Strict dynamic calculation) */}
          <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 start-0 w-1.5 h-full bg-[#DC2626]" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600">متأخرات تجاوزت الاستحقاق</span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#DC2626]">
                {formatCurrency(overview.totalOverdue)}
              </div>
              <div className="text-[11px] text-red-500 font-semibold mt-1">
                {overview.overdueCount} فاتورة مستحقة متأخرة
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approvals Alert Banner */}
      {overview && overview.pendingApprovalCount > 0 && hasRole(['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT']) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              {overview.pendingApprovalCount}
            </div>
            <div>
              <div className="font-bold text-neutral-900 text-sm">
                توجد فواتير بانتظار المراجعة والاعتماد
              </div>
              <div className="text-xs text-neutral-500">
                يجب اعتمادها حسب مستويات الصلاحية المالية قبل إرسالها للعميل
              </div>
            </div>
          </div>
          <Link
            to="/approvals"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            مراجعة الطلبات
          </Link>
        </div>
      )}

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-neutral-900 text-base">أحدث الفواتير</h2>
            <p className="text-xs text-neutral-400 mt-0.5">آخر الفواتير الصادرة والمسودات في النظام</p>
          </div>
          <Link
            to="/invoices"
            className="flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:text-[#B91C1C]"
          >
            <span>عرض كل الفواتير</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs font-bold">
              <tr>
                <th className="p-4 text-start">رقم الفاتورة</th>
                <th className="p-4 text-start">العميل</th>
                <th className="p-4 text-start">تاريخ الاستحقاق</th>
                <th className="p-4 text-start">الإجمالي</th>
                <th className="p-4 text-start">المتبقي</th>
                <th className="p-4 text-start">الحالة</th>
                <th className="p-4 text-end">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400 text-sm">
                    لا توجد فواتير بعد. ابدأ بإنشاء فاتورة جديدة.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => {
                  const badge = statusBadges[inv.status] || {
                    label: inv.status,
                    bg: 'bg-neutral-100',
                    text: 'text-neutral-700',
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="p-4 font-bold text-neutral-900">
                        <Link to={`/invoices/${inv.id}`} className="hover:text-[#DC2626]">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-neutral-800">{inv.client?.name}</div>
                        {inv.client?.companyName && (
                          <div className="text-[11px] text-neutral-400">{inv.client.companyName}</div>
                        )}
                      </td>
                      <td className="p-4 text-neutral-600 text-xs font-medium">
                        {new Date(inv.dueDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-4 font-bold text-neutral-900">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="p-4 font-bold text-neutral-700">
                        {formatCurrency(inv.remainingBalance)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                          {inv.isOverdue && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                              متأخرة ({inv.daysOverdue} يوم)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-end">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-[#DC2626] hover:text-[#DC2626] text-xs font-bold transition-all inline-block"
                        >
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
