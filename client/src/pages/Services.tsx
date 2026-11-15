import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { Service } from '../types/index.js';
import { Briefcase, Plus, Tag, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
  const canManage = hasRole(['ADMIN', 'FINANCE_MANAGER']);

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
                <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
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
    </div>
  );
};
