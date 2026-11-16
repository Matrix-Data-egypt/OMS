import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { MediaContentType } from '../types/index.js';
import { Layers, Plus, Trash2, Copy, Check } from 'lucide-react';

export const ContentTypes: React.FC = () => {
  const [types, setTypes] = useState<MediaContentType[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchTypes = async () => {
    setLoading(true);
    const res = await apiRequest<MediaContentType[]>('/content-types');
    if (res.success && res.data) {
      setTypes(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setMessage(null);

    const res = await apiRequest('/content-types', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setName('');
      setMessage({ text: 'تمت إضافة نوع المحتوى بنجاح وتوليد المعرف الفرعي (ID) للربط', type: 'success' });
      fetchTypes();
    } else {
      setMessage({ text: res.message || 'فشل إضافة نوع المحتوى', type: 'error' });
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف نوع المحتوى؟')) return;
    const res = await apiRequest(`/content-types/${id}`, { method: 'DELETE' });
    if (res.success) {
      setMessage({ text: 'تم حذف نوع المحتوى بنجاح', type: 'success' });
      fetchTypes();
    } else {
      setMessage({ text: res.message || 'فشل حذف نوع المحتوى', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">أنواع المحتوى (Content Types)</h1>
        <p className="text-xs text-neutral-500 mt-1">
          تسجيل تصنيفات المحتوى (فيديو، ريلز، تصميم ثابت، مقال، إلخ) مع توليد معرف فريد (ID) للربط المباشر
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

      {/* Add Content Type Form */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#DC2626]" />
          <span>إضافة نوع محتوى جديد (كتابة الاسم فقط)</span>
        </h2>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="اكتب نوع المحتوى (مثل: فيديو ترويجي، ريلز، بانر جرافيك، مقال)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#DC2626] transition-colors"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-neutral-300 text-white text-xs font-black rounded-2xl shadow-md shadow-red-600/20 transition-all shrink-0"
          >
            {submitting ? 'جاري الإضافة...' : 'حفظ وتوليد ID'}
          </button>
        </form>
      </div>

      {/* Content Types Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <span className="font-extrabold text-xs text-neutral-800">قائمة أنواع المحتوى والمعرفات المتصلة</span>
          <span className="text-[11px] font-bold text-neutral-400">{types.length} نوع</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#171717] text-white">
              <tr>
                <th className="p-4 text-start">نوع المحتوى (Content Type Name)</th>
                <th className="p-4 text-start">معرف الربط الفريد (ID للربط)</th>
                <th className="p-4 text-center">المحتويات التابعة له</th>
                <th className="p-4 text-start">تاريخ الإضافة</th>
                <th className="p-4 text-end">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-bold">
                    جاري تحميل أنواع المحتوى...
                  </td>
                </tr>
              ) : types.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-bold">
                    لا توجد أنواع محتوى مضافة بعد.
                  </td>
                </tr>
              ) : (
                types.map((ct) => (
                  <tr key={ct.id} className="hover:bg-neutral-50/70">
                    <td className="p-4 font-black text-neutral-900 text-sm">{ct.name}</td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 border border-neutral-200 font-mono text-[11px] text-neutral-700">
                        <span>{ct.id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(ct.id)}
                          className="hover:text-[#DC2626]"
                          title="نسخ المعرف"
                        >
                          {copiedId === ct.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px]">
                        {ct._count?.contents || 0} محتوى
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500 text-[11px]">
                      {new Date(ct.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 text-end">
                      <button
                        onClick={() => handleDelete(ct.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="حذف نوع المحتوى"
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
