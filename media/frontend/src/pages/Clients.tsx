import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { MediaClient } from '../types/index.js';
import { Users, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Clients: React.FC = () => {
  const { isReadOnly } = useAuth();
  const [clients, setClients] = useState<MediaClient[]>([]);
  const [name, setName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const res = await apiRequest<MediaClient[]>('/clients');
    if (res.success && res.data) {
      setClients(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setMessage(null);

    const res = await apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        taxNumber: taxNumber.trim() || undefined,
      }),
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setName('');
      setTaxNumber('');
      setMessage({
        text: 'تمت إضافة العميل بنجاح!',
        type: 'success',
      });
      fetchClients();
    } else {
      setMessage({ text: res.message || 'فشل إضافة العميل', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل من قسم الميديا؟')) return;
    const res = await apiRequest(`/clients/${id}`, { method: 'DELETE' });
    if (res.success) {
      setMessage({ text: 'تم حذف العميل بنجاح', type: 'success' });
      fetchClients();
    } else {
      setMessage({ text: res.message || 'فشل حذف العميل', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">إدارة عملاء الميديا (Clients)</h1>
        <p className="text-xs text-neutral-500 mt-1">
          تسجيل وإدارة عملاء قسم الميديا وسجلاتهم الضريبية
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Add Client Form */}
      {!isReadOnly && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#DC2626]" />
            <span>إضافة عميل جديد (الاسم الكامل + السجل الضريبي)</span>
          </h2>

          <form onSubmit={handleAddClient} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="اكتب الاسم بالكامل للعميل هنا..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#DC2626] transition-colors"
            />
            <input
              type="text"
              placeholder="السجل الضريبي (اختياري)..."
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              className="w-full sm:w-56 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#DC2626] transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-neutral-300 text-white text-xs font-black rounded-2xl shadow-md shadow-red-600/20 transition-all shrink-0 cursor-pointer"
            >
              {submitting ? 'جاري الإضافة...' : 'حفظ العميل'}
            </button>
          </form>
        </div>
      )}

      {/* Clients List Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <span className="font-extrabold text-xs text-neutral-800">قائمة عملاء الميديا</span>
          <span className="text-[11px] font-bold text-neutral-400">{clients.length} عميل</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#171717] text-white">
              <tr>
                <th className="p-4 text-start">الاسم الكامل للعميل</th>
                <th className="p-4 text-start">السجل الضريبي</th>
                <th className="p-4 text-start">المعرف (ID)</th>
                <th className="p-4 text-center">الحملات المرتبطة</th>
                <th className="p-4 text-start">تاريخ الإضافة</th>
                <th className="p-4 text-end">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400 font-bold">
                    جاري تحميل العملاء...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-400 font-bold">
                    لا يوجد عملاء مضافين. أضف أول عميل أعلاه.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/70">
                    <td className="p-4 font-black text-neutral-900 text-sm">{c.name}</td>
                    <td className="p-4">
                      {c.taxNumber ? (
                        <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-lg border border-neutral-200">
                          {c.taxNumber}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">غير مسجل</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-neutral-400">{c.id}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#DC2626] font-extrabold text-[11px]">
                        {c._count?.records || 0} حملة
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    {!isReadOnly && (
                      <td className="p-4 text-end">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="حذف العميل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
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
