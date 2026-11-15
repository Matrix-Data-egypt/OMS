import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import { Invoice } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { CheckCircle2, AlertCircle, ShieldAlert, FileText, ArrowRight, Eye } from 'lucide-react';

export const Approvals: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchApprovals = async () => {
    setLoading(true);
    const res = await apiRequest<Invoice[]>('/approvals/pending');
    if (res.success && res.data) {
      setInvoices(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApprovals();
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
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-600">مركز المراجعة والاعتماد المالي</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">الفواتير بانتظار الاعتماد</h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            تُعرض هنا الفواتير الموجهة لمستواك الصلاحي. بموجب مبدأ فصل المهام (Separation of Duties)، يتم حجب أي فاتورة أنشأتها بنفسك تلقائياً لمنع الاعتماد الذاتي.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
            {invoices.length} فواتير معلقة
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs font-bold border-b border-neutral-200">
              <tr>
                <th className="p-4 text-start">رقم الفاتورة</th>
                <th className="p-4 text-start">العميل</th>
                <th className="p-4 text-start">أنشئت بواسطة</th>
                <th className="p-4 text-start">المستوى المطلوب</th>
                <th className="p-4 text-start">القيمة الإجمالية</th>
                <th className="p-4 text-start">تاريخ الإنشاء</th>
                <th className="p-4 text-end">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400 text-sm">
                    جاري فحص طلبات الاعتماد...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400 text-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <div className="font-bold text-neutral-800">لا توجد فواتير معلقة بانتظار اعتمادك حالياً!</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      تمت مراجعة جميع المستندات المالية في نطاق صلاحياتك.
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const pendingStep = inv.approvalSteps?.[0];
                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50/70 transition-colors">
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
                      <td className="p-4">
                        <div className="font-bold text-neutral-700 text-xs">{inv.createdBy?.name}</div>
                        <div className="text-[10px] text-neutral-400">{inv.createdBy?.role}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          مستوى {pendingStep?.levelOrder || '1'} ({pendingStep?.rule?.requiredRole || 'مطلوب'})
                        </span>
                      </td>
                      <td className="p-4 font-black text-neutral-900 text-base">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="p-4 text-neutral-500 text-xs">
                        {new Date(inv.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-4 text-end">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shadow-red-600/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مراجعة واعتماد</span>
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
