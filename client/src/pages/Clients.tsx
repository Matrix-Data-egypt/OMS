import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { Client } from '../types/index.js';
import { Users, Plus, Phone, Mail, Building, FileText, Check, AlertCircle } from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    taxNumber: '',
    address: '',
    notes: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const res = await apiRequest<Client[]>('/clients');
    if (res.success && res.data) {
      setClients(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionLoading(true);

    const res = await apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    setActionLoading(false);

    if (res.success) {
      setShowModal(false);
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        whatsappNumber: '',
        taxNumber: '',
        address: '',
        notes: '',
      });
      fetchClients();
    } else {
      setError(res.message || 'فشل إضافة العميل');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">سجل عملاء OMS</h1>
          <p className="text-xs text-neutral-500 mt-1">
            إدارة بيانات العملاء والشركات والأرقام الضريبية وأرقام واتساب للأعمال المعتمدة
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold shadow-md shadow-red-600/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-neutral-400 font-bold">
            جاري تحميل قائمة العملاء...
          </div>
        ) : clients.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-neutral-400 font-bold bg-white rounded-3xl border border-neutral-200">
            لا يوجد عملاء مضافين حتى الآن.
          </div>
        ) : (
          clients.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4 hover:border-neutral-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-neutral-900">{c.name}</h3>
                  {c.companyName && (
                    <div className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{c.companyName}</span>
                    </div>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#DC2626] flex items-center justify-center font-bold text-xs shrink-0">
                  {c.name.charAt(0)}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">الرقم الضريبي:</span>
                  <span className="font-bold text-neutral-800">{c.taxNumber || 'غير مسجل'}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">الهاتف:</span>
                    <span className="font-medium text-neutral-800">{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">البريد:</span>
                    <span className="font-medium text-neutral-800 truncate max-w-[170px]">{c.email}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">العنوان:</span>
                    <span className="font-medium text-neutral-800 truncate max-w-[170px]">{c.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="font-black text-neutral-900 text-lg">إضافة عميل جديد</h3>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-bold">{error}</div>
            )}
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">اسم المسؤول / جهة الاتصال *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">اسم الشركة</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">الرقم الضريبي (سجل ضريبي)</label>
                  <input
                    type="text"
                    placeholder="مثال: 123-456-789"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">رقم الواتساب المعتمد</label>
                  <input
                    type="text"
                    placeholder="+2010xxxxxxxx"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">ملاحظات داخلية</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl"
                >
                  حفظ العميل
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
