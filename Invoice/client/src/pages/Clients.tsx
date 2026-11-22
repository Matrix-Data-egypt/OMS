import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { Client } from '../types/index.js';
import { Users, Plus, Phone, Mail, Building, FileText, Check, AlertCircle, Trash2, Pencil } from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setError(null);
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
    setShowModal(true);
  };

  const handleOpenEditModal = (c: Client) => {
    setEditingClient(c);
    setError(null);
    setFormData({
      name: c.name || '',
      companyName: c.companyName || '',
      email: c.email || '',
      phone: c.phone || '',
      whatsappNumber: c.whatsappNumber || '',
      taxNumber: c.taxNumber || '',
      address: c.address || '',
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleDeleteClient = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    const res = await apiRequest(`/clients/${deleteConfirm.id}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: res.message || 'تم حذف العميل بنجاح' });
      setDeleteConfirm(null);
      fetchClients();
      setTimeout(() => setFeedbackMessage(null), 4000);
    } else {
      setFeedbackMessage({ type: 'error', text: res.message || 'فشل حذف العميل' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionLoading(true);

    const isEdit = !!editingClient;
    const url = isEdit ? `/clients/${editingClient.id}` : '/clients';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiRequest(url, {
      method,
      body: JSON.stringify(formData),
    });

    setActionLoading(false);

    if (res.success) {
      setShowModal(false);
      setEditingClient(null);
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
      setFeedbackMessage({
        type: 'success',
        text: res.message || (isEdit ? 'تم تحديث بيانات العميل بنجاح' : 'تم إضافة العميل بنجاح'),
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
      fetchClients();
    } else {
      setError(res.message || (isEdit ? 'فشل تحديث بيانات العميل' : 'فشل إضافة العميل'));
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
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold shadow-md shadow-red-600/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
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
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-[#DC2626] flex items-center justify-center font-bold text-xs">
                    {c.name.charAt(0)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(c)}
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-all shadow-sm"
                    title="تعديل بيانات العميل"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ id: c.id, name: c.name })}
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-[#DC2626] flex items-center justify-center transition-all shadow-sm"
                    title="حذف العميل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
            <h3 className="font-black text-neutral-900 text-lg">
              {editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
            </h3>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-bold">{error}</div>
            )}
            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
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
                  className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {actionLoading
                    ? 'جاري الحفظ...'
                    : editingClient
                    ? 'تحديث بيانات العميل'
                    : 'حفظ العميل'}
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
              <h3 className="font-black text-neutral-900 text-base">تأكيد حذف العميل</h3>
              <p className="text-xs text-neutral-500 mt-1">
                هل أنت متأكد من حذف العميل <strong className="text-neutral-800 font-black">"{deleteConfirm.name}"</strong>؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteClient}
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
