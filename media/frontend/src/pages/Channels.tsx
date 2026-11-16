import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { MediaChannel } from '../types/index.js';
import { Tv, Plus, Trash2 } from 'lucide-react';

export const Channels: React.FC = () => {
  const [channels, setChannels] = useState<MediaChannel[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchChannels = async () => {
    setLoading(true);
    const res = await apiRequest<MediaChannel[]>('/channels');
    if (res.success && res.data) {
      setChannels(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setMessage(null);

    const res = await apiRequest('/channels', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setName('');
      setMessage({ text: 'تمت إضافة القناة بنجاح', type: 'success' });
      fetchChannels();
    } else {
      setMessage({ text: res.message || 'فشل إضافة القناة', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه القناة؟')) return;
    const res = await apiRequest(`/channels/${id}`, { method: 'DELETE' });
    if (res.success) {
      setMessage({ text: 'تم حذف القناة بنجاح', type: 'success' });
      fetchChannels();
    } else {
      setMessage({ text: res.message || 'فشل حذف القناة', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">القنوات الإعلانية (Channels)</h1>
        <p className="text-xs text-neutral-500 mt-1">
          تسجيل المنصات والقنوات الإعلانية (Facebook, TikTok, Google, TV, Outdoor وغيرها) بالاسم فقط
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
          {message.text}
        </div>
      )}

      {/* Add Channel Form (Name ONLY) */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#DC2626]" />
          <span>إضافة قناة جديدة (الاسم فقط)</span>
        </h2>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="اكتب اسم القناة (مثل: Facebook, YouTube, Google Search, TikTok)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#DC2626] transition-colors"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-neutral-300 text-white text-xs font-black rounded-2xl shadow-md shadow-red-600/20 transition-all shrink-0"
          >
            {submitting ? 'جاري الإضافة...' : 'حفظ القناة'}
          </button>
        </form>
      </div>

      {/* Channels Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <span className="font-extrabold text-xs text-neutral-800">قائمة القنوات الإعلانية</span>
          <span className="text-[11px] font-bold text-neutral-400">{channels.length} قناة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#171717] text-white">
              <tr>
                <th className="p-4 text-start">اسم القناة الإعلانية</th>
                <th className="p-4 text-start">المعرف (ID)</th>
                <th className="p-4 text-center">الحملات المرتبطة</th>
                <th className="p-4 text-start">تاريخ الإضافة</th>
                <th className="p-4 text-end">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-bold">
                    جاري تحميل القنوات...
                  </td>
                </tr>
              ) : channels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-bold">
                    لا توجد قنوات مضافة بعد.
                  </td>
                </tr>
              ) : (
                channels.map((ch) => (
                  <tr key={ch.id} className="hover:bg-neutral-50/70">
                    <td className="p-4 font-black text-neutral-900 text-sm">{ch.name}</td>
                    <td className="p-4 font-mono text-[10px] text-neutral-400">{ch.id}</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#DC2626] font-extrabold text-[11px]">
                        {ch._count?.records || 0} حملة
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500 text-[11px]">
                      {new Date(ch.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 text-end">
                      <button
                        onClick={() => handleDelete(ch.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="حذف القناة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
