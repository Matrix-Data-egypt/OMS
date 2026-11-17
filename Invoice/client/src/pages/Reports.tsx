import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { FinancialOverview } from '../types/index.js';
import { BarChart3, TrendingUp, CreditCard, AlertTriangle, ShieldCheck, PieChart } from 'lucide-react';

export const Reports: React.FC = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      const res = await apiRequest<FinancialOverview>('/reports/overview');
      if (res.success && res.data) {
        setOverview(res.data);
      }
      setLoading(false);
    };

    fetchOverview();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">التقارير والمؤشرات المالية لشركة OMS</h1>
        <p className="text-xs text-neutral-500 mt-1">
          تحليل السيولة النقدية، معدلات التحصيل، ومتابعة الفواتير المتأخرة والضرائب
        </p>
      </div>

      {overview && (
        <>
          {/* Main Financial Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-3">
              <span className="text-xs font-bold text-neutral-500">إجمالي الفواتير الصادرة</span>
              <div className="text-3xl font-black text-neutral-900">{formatCurrency(overview.totalBilled)}</div>
              <div className="text-xs text-neutral-400">
                تشمل جميع الفواتير المعتمدة والمصدرة للعملاء
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-3">
              <span className="text-xs font-bold text-emerald-600">المحصل الفعلي بالخزينة / البنك</span>
              <div className="text-3xl font-black text-emerald-600">{formatCurrency(overview.totalCollected)}</div>
              <div className="text-xs text-neutral-500 font-medium">
                معدل التحصيل العام: <span className="font-extrabold text-emerald-700">{overview.collectionRate}%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 start-0 w-2 h-full bg-[#DC2626]" />
              <span className="text-xs font-bold text-red-600">المتأخرات الحرجة (Overdue)</span>
              <div className="text-3xl font-black text-[#DC2626]">{formatCurrency(overview.totalOverdue)}</div>
              <div className="text-xs text-red-500 font-semibold">
                {overview.overdueCount} فواتير تجاوزت موعد الاستحقاق دون سداد كامل
              </div>
            </div>
          </div>

          {/* Collection Progress Bar */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-neutral-900 text-sm">معدل تحصيل السيولة النقدية</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  نسبة المبالغ المحصلة فعلياً مقارنة بإجمالي الفواتير
                </p>
              </div>
              <span className="text-xl font-black text-[#DC2626]">{overview.collectionRate}%</span>
            </div>

            <div className="w-full h-4 bg-neutral-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(overview.collectionRate, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-50">
                <span className="text-[11px] text-neutral-400 block font-bold">فواتير مسددة بالكامل</span>
                <span className="text-base font-black text-neutral-900">{overview.paidCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50">
                <span className="text-[11px] text-neutral-400 block font-bold">بانتظار الاعتماد</span>
                <span className="text-base font-black text-amber-600">{overview.pendingApprovalCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50">
                <span className="text-[11px] text-neutral-400 block font-bold">فواتير مسودات</span>
                <span className="text-base font-black text-neutral-900">{overview.draftCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50">
                <span className="text-[11px] text-neutral-400 block font-bold">إجمالي العملاء النشطين</span>
                <span className="text-base font-black text-neutral-900">{overview.totalClients}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
