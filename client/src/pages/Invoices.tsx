import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import { Invoice } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { PlusCircle, Search, Filter, AlertTriangle, Eye, FileText } from 'lucide-react';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { hasRole } = useAuth();

  const fetchInvoices = async () => {
    setLoading(true);
    const query = statusFilter !== 'ALL' && statusFilter !== 'OVERDUE' ? `?status=${statusFilter}` : '';
    const res = await apiRequest<Invoice[]>(`/invoices${query}`);
    if (res.success && res.data) {
      let filtered = res.data;
      if (statusFilter === 'OVERDUE') {
        filtered = filtered.filter((i) => i.isOverdue);
      }
      if (searchTerm) {
        filtered = filtered.filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setInvoices(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">إدارة فواتير OMS</h1>
          <p className="text-xs text-neutral-500 mt-1">
            متابعة دورة حياة الفاتورة من الإنشاء، الاعتماد، الإصدار، وحتى التحصيل النهائي
          </p>
        </div>

        {hasRole(['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT']) && (
          <Link
            to="/invoices/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold shadow-md shadow-red-600/20 transition-all self-start"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إنشاء فاتورة جديدة</span>
          </Link>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'DRAFT', label: 'المسودات' },
            { id: 'PENDING_APPROVAL', label: 'قيد الاعتماد' },
            { id: 'APPROVED', label: 'المعتمدة' },
            { id: 'ISSUED', label: 'المصدرة' },
            { id: 'OVERDUE', label: 'المتأخرات' },
            { id: 'PAID', label: 'المسددة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-[#171717] text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute top-3 start-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الفاتورة أو اسم العميل..."
            className="w-full ps-10 pe-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-[#DC2626] transition-colors"
          />
        </form>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs font-bold border-b border-neutral-200">
              <tr>
                <th className="p-4 text-start">رقم الفاتورة</th>
                <th className="p-4 text-start">العميل</th>
                <th className="p-4 text-start">تاريخ الإصدار</th>
                <th className="p-4 text-start">تاريخ الاستحقاق</th>
                <th className="p-4 text-start">القيمة الإجمالية</th>
                <th className="p-4 text-start">المتبقي</th>
                <th className="p-4 text-start">الحالة</th>
                <th className="p-4 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-neutral-400 text-sm">
                    جاري تحميل بيانات الفواتير...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-neutral-400 text-sm">
                    لا توجد فواتير مطابقة للبحث أو التصفية الحالية.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const badge = statusBadges[inv.status] || {
                    label: inv.status,
                    bg: 'bg-neutral-100',
                    text: 'text-neutral-700',
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-4 font-bold text-neutral-900">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="hover:text-[#DC2626] flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-neutral-400" />
                          <span>{inv.invoiceNumber}</span>
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-neutral-800">{inv.client?.name}</div>
                        {inv.client?.companyName && (
                          <div className="text-[11px] text-neutral-400">{inv.client.companyName}</div>
                        )}
                      </td>
                      <td className="p-4 text-neutral-500 text-xs font-medium">
                        {new Date(inv.issueDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-4 text-neutral-600 text-xs font-medium">
                        {new Date(inv.dueDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-4 font-extrabold text-neutral-900">
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
                          className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-[#DC2626] hover:text-[#DC2626] text-xs font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
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
