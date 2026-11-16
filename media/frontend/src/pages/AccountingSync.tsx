import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { Receipt, CheckCircle, ExternalLink, ArrowUpRight, TrendingUp, DollarSign } from 'lucide-react';

interface LinkedInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: string;
  dueDate: string;
}

export const AccountingSync: React.FC = () => {
  const [invoices, setInvoices] = useState<LinkedInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const res = await apiRequest<LinkedInvoice[]>('/accounting/linked-invoices');
      if (res.success && res.data) {
        setInvoices(res.data);
      }
      setLoading(false);
    };

    fetchInvoices();
  }, []);

  const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + Number(inv.paidAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-[#DC2626]" />
            <span className="text-xs font-bold text-red-600">الربط المالي المباشر</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            فواتير قسم المحاسبة المرتبطة بالميديا
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            الفواتير الرسمية الصادرة من حملات الميديا داخل نظام المحاسبة المركزي OMS Invoice
          </p>
        </div>

        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#171717] hover:bg-neutral-800 text-white text-xs font-black shadow-md transition-all self-start"
        >
          <span>فتح نظام الفواتير والمحاسبة</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Financial Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-neutral-500">إجمالي الفواتير الصادرة للميديا</span>
          <div className="text-2xl font-black text-neutral-900">{totalBilled.toLocaleString()} ج.م</div>
          <div className="text-[11px] text-neutral-400">فواتير رسمية مسجلة بالنظام</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-emerald-600">المحصل الفعلي بالخزينة</span>
          <div className="text-2xl font-black text-emerald-600">{totalCollected.toLocaleString()} ج.م</div>
          <div className="text-[11px] text-neutral-400">سددها العملاء فعلياً</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-neutral-500">عدد الفواتير الصادرة</span>
          <div className="text-2xl font-black text-neutral-900">{invoices.length}</div>
          <div className="text-[11px] text-neutral-400">فاتورة مرتبطة بحملات إعلانية</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <span className="font-extrabold text-xs text-neutral-800">قائمة الفواتير المربوطة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#171717] text-white">
              <tr>
                <th className="p-4 text-start">رقم الفاتورة</th>
                <th className="p-4 text-start">العميل (Client)</th>
                <th className="p-4 text-start">الإجمالي (شامل VAT)</th>
                <th className="p-4 text-start">المسدد</th>
                <th className="p-4 text-start">المتبقي</th>
                <th className="p-4 text-start">تاريخ الاستحقاق</th>
                <th className="p-4 text-start">الحالة</th>
                <th className="p-4 text-end">عرض الفاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-neutral-400 font-bold">
                    جاري فحص فواتير قسم المحاسبة...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-neutral-400 font-bold">
                    لم يتم إصدار فواتير من قسم الميديا بعد. يمكنك إصدار فاتورة من جدول الحملات في الـ Dashboard.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50/70">
                    <td className="p-4 font-black text-neutral-900 text-sm">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4 font-bold text-neutral-800">{inv.clientName}</td>
                    <td className="p-4 font-black text-neutral-900">
                      {Number(inv.totalAmount).toLocaleString()} ج.م
                    </td>
                    <td className="p-4 font-bold text-emerald-600">
                      {Number(inv.paidAmount).toLocaleString()} ج.م
                    </td>
                    <td className="p-4 font-bold text-neutral-700">
                      {Number(inv.remainingBalance).toLocaleString()} ج.م
                    </td>
                    <td className="p-4 text-neutral-500">
                      {new Date(inv.dueDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-neutral-100 text-neutral-700">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-end">
                      <a
                        href={`http://localhost:5173/invoices/${inv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-[#DC2626] hover:text-[#DC2626] font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                      >
                        <span>فتح في المحاسبة</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
