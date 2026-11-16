import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { MediaContent, MediaContentType } from '../types/index.js';
import { FileVideo, Plus, Trash2, Copy, Check, Layers } from 'lucide-react';

export const Contents: React.FC = () => {
  const [contents, setContents] = useState<MediaContent[]>([]);
  const [types, setTypes] = useState<MediaContentType[]>([]);
  const [name, setName] = useState('');
  const [contentTypeId, setContentTypeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [cRes, tRes] = await Promise.all([
      apiRequest<MediaContent[]>('/contents'),
      apiRequest<MediaContentType[]>('/content-types'),
    ]);

    if (cRes.success && cRes.data) setContents(cRes.data);
    if (tRes.success && tRes.data) {
      setTypes(tRes.data);
      if (tRes.data.length > 0) setContentTypeId(tRes.data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contentTypeId) return;

    setSubmitting(true);
    setMessage(null);

    const res = await apiRequest('/contents', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        contentTypeId,
      }),
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setName('');
      setMessage({ text: 'تمت إضافة المحتوى وربطه بنوع المحتوى عبر المعرف بنجاح', type: 'success' });
      fetchData();
    } else {
      setMessage({ text: res.message || 'فشل إضافة المحتوى', type: 'error' });
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    const res = await apiRequest(`/contents/${id}`, { method: 'DELETE' });
    if (res.success) {
      setMessage({ text: 'تم حذف المحتوى بنجاح', type: 'success' });
      fetchData();
    } else {
      setMessage({ text: res.message || 'فشل حذف المحتوى', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">إدارة المحتوى (Contents)</h1>
        <p className="text-xs text-neutral-500 mt-1">
          تسجيل بنود ومواد المحتوى وربطها بنوع المحتوى (Content Type) عبر المعرفات المتصلة (ID)
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

      {/* Add Content Form (Name + Link with Content Type ID) */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#DC2626]" />
          <span>إضافة محتوى جديد وربطه بالنوع</span>
        </h2>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <input
              type="text"
              required
              placeholder="اكتب اسم المحتوى الإعلاني..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#DC2626] transition-colors"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              required
              value={contentTypeId}
              onChange={(e) => setContentTypeId(e.target.value)}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#DC2626] transition-colors"
            >
              <option value="">-- اختر نوع المحتوى المربوط --</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (ID: {t.id.slice(0, 8)}...)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-neutral-300 text-white text-xs font-black rounded-2xl shadow-md shadow-red-600/20 transition-all shrink-0"
            >
              {submitting ? 'حفظ...' : 'حفظ وربط'}
            </button>
          </div>
        </form>
      </div>

      {/* Contents Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <span className="font-extrabold text-xs text-neutral-800">قائمة المحتويات المربوطة</span>
          <span className="text-[11px] font-bold text-neutral-400">{contents.length} محتوى</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#171717] text-white">
              <tr>
                <th className="p-4 text-start">اسم المحتوى (Content Name)</th>
                <th className="p-4 text-start">نوع المحتوى المربوط به</th>
                <th className="p-4 text-start">معرف المحتوى (ID)</th>
                <th className="p-4 text-center">الحملات المرتبطة</th>
                <th className="p-4 text-end">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-bold">
                    جاري تحميل المحتويات...
                  </td>
                </tr>
              ) : contents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-bold">
                    لا يوجد محتوى مسجل بعد. أضف أول محتوى أعلاه.
                  </td>
                </tr>
              ) : (
                contents.map((cnt) => (
                  <tr key={cnt.id} className="hover:bg-neutral-50/70">
                    <td className="p-4 font-black text-neutral-900 text-sm">{cnt.name}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{cnt.contentType?.name || 'نوع مخصص'}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-neutral-100 border border-neutral-200 font-mono text-[10px] text-neutral-600">
                        <span>{cnt.id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(cnt.id)}
                          className="hover:text-[#DC2626]"
                          title="نسخ المعرف"
                        >
                          {copiedId === cnt.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-neutral-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#DC2626] font-extrabold text-[11px]">
                        {cnt._count?.records || 0} حملة
                      </span>
                    </td>
                    <td className="p-4 text-end">
                      <button
                        onClick={() => handleDelete(cnt.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="حذف المحتوى"
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
