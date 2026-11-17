import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import { Payment } from '../types/index.js';
import { CreditCard, FileText, ArrowUpRight } from 'lucide-react';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const res = await apiRequest<any[]>('/payments');
      if (res.success && res.data) {
        setPayments(res.data);
      }
      setLoading(false);
    };

    fetchPayments();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const methodLabels: Record<string, string> = {
    BANK_TRANSFER: 'تحويل بنكي',
    CASH: 'نقدي',
    CHEQUE: 'شيك',
    ONLINE: 'دفع إلكتروني',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">سجل المدفوعات والتحصيلات</h1>
        <p className="text-xs text-neutral-500 mt-1">
          قائمة بجميع الدفعات المالية المسجلة على فواتير عملاء OMS بالجنيه المصري
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs font-bold border-b border-neutral-200">
              <tr>
                <th className="p-4 text-start">الفاتورة</th>
                <th className="p-4 text-start">العميل</th>
                <th className="p-4 text-start">قيمة الدفعة</th>
                <th className="p-4 text-start">طريقة الدفع</th>
                <th className="p-4 text-start">المرجع / الإيصال</th>
                <th className="p-4 text-start">تاريخ التحصيل</th>
                <th className="p-4 text-start">المسجل</th>
                <th className="p-4 text-end">عرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-neutral-400 text-sm">
                    جاري تحميل سجل المدفوعات...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-neutral-400 text-sm">
                    لا توجد مدفوعات مسجلة بعد.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="p-4 font-bold text-neutral-900">
                      <Link
                        to={`/invoices/${p.invoiceId}`}
                        className="hover:text-[#DC2626] flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{p.invoice?.invoiceNumber}</span>
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-neutral-800">{p.invoice?.client?.name}</div>
                      {p.invoice?.client?.companyName && (
                        <div className="text-[11px] text-neutral-400">{p.invoice.client.companyName}</div>
                      )}
                    </td>
                    <td className="p-4 font-black text-emerald-600">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="p-4 text-neutral-700 text-xs font-semibold">
                      {methodLabels[p.paymentMethod] || p.paymentMethod}
                    </td>
                    <td className="p-4 text-neutral-500 text-xs font-mono">
                      {p.referenceNumber || '-'}
                    </td>
                    <td className="p-4 text-neutral-500 text-xs">
                      {new Date(p.paymentDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 text-neutral-700 text-xs font-medium">
                      {p.recordedBy?.name}
                    </td>
                    <td className="p-4 text-end">
                      <Link
                        to={`/invoices/${p.invoiceId}`}
                        className="text-neutral-400 hover:text-[#DC2626]"
                      >
                        <ArrowUpRight className="w-4 h-4 inline" />
                      </Link>
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
