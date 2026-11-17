import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { Service } from '../types/index.js';
import { Briefcase, Plus, Tag, Check, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    description: '',
    defaultPrice: 0,
    defaultTaxRate: 14.00,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT']);

  const fetchServices = async () => {
    setLoading(true);
    const res = await apiRequest<Service[]>('/services');
    if (res.success && res.data) {
      setServices(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDeleteService = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    const res = await apiRequest(`/services/${deleteConfirm.id}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: res.message || 'تم حذف الخدمة بنجاح' });
      setDeleteConfirm(null);
      fetchServices();
      setTimeout(() => setFeedbackMessage(null), 4000);
    } else {
      setFeedbackMessage({ type: 'error', text: res.message || 'فشل حذف الخدمة' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionLoading(true);

    const res = await apiRequest('/services', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    setActionLoading(false);

    if (res.success) {
      setShowModal(false);
      setFormData({
        nameAr: '',
        nameEn: '',
        description: '',
        defaultPrice: 0,
        defaultTaxRate: 14.00,
      });
      fetchServices();
    } else {
      setError(res.message || 'فشل حفظ الخدمة');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">دليل خدمات OMS</h1>
          <p className="text-xs text-neutral-500 mt-1">
            تسجيل خدمات التسويق الرقمي، الهويات البصرية، والتطوير البرمجي مع أسعارها الافتراضية
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold shadow-md shadow-red-600/20 transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خدمة جديدة</span>
          </button>
        )}
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="hover:opacity-75 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-neutral-400 font-bold">
            جاري تحميل الخدمات...
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-neutral-400 font-bold bg-white rounded-3xl border border-neutral-200">
            لا توجد خدمات مضافة حتى الآن.
          </div>
        ) : (
          services.map((s) => (
            <div
              key={s.id}
              className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-3 hover:border-neutral-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-neutral-900">{s.nameAr}</h3>
                  <div className="text-xs font-semibold text-neutral-400">{s.nameEn}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ id: s.id, name: s.nameAr })}
                      className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-[#DC2626] flex items-center justify-center transition-all shadow-sm"
                      title="حذف الخدمة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {s.description && (
                <p className="text-xs text-neutral-500 line-clamp-2">{s.description}</p>
              )}

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold">السعر الافتراضي</span>
                  <span className="text-base font-black text-neutral-900">
                    {Number(s.defaultPrice).toLocaleString()} ج.م
                  </span>
                </div>
                <div className="text-end">
                  <span className="text-[10px] text-neutral-400 block font-semibold">الضريبة المطبقة</span>
                  <span className="text-xs font-bold text-neutral-700">{s.defaultTaxRate}% VAT</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-black text-neutral-900 text-lg">إضافة خدمة جديدة</h3>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-bold">{error}</div>
            )}
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">اسم الخدمة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: إدارة حملات إعلانية"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">اسم الخدمة بالإنجليزية *</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. Ad Campaign Management"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">السعر الافتراضي (ج.م) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">نسبة الضريبة (VAT %)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.defaultTaxRate}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl"
                >
                  حفظ الخدمة
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-neutral-900 text-base">تأكيد حذف الخدمة</h3>
              <p className="text-xs text-neutral-500 mt-1">
                هل أنت متأكد من حذف الخدمة <strong className="text-neutral-800 font-black">"{deleteConfirm.name}"</strong>؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteService}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {deleteLoading ? 'جاري الحذف...' : 'نعم، حذف'}
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
