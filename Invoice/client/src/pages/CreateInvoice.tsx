import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import { Client, Service, InvoiceItem } from '../types/index.js';
import { Plus, Trash2, ArrowRight, Calculator, FileCheck, AlertCircle } from 'lucide-react';

export const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15); // Default 15 days payment terms
    return d.toISOString().split('T')[0];
  });

  const [items, setItems] = useState<
    { serviceId: string; description: string; quantity: number; unitPrice: number; discount: number }[]
  >([
    { serviceId: '', description: '', quantity: 1, unitPrice: 0, discount: 0 },
  ]);

  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(14.00); // 14% VAT Egyptian Standard
  const [applyWht, setApplyWht] = useState(false); // 1% Withholding
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(
    'شروط السداد: يتم السداد بالجنيه المصري عبر تحويل بنكي لحساب شركة OMS خلال 15 يوماً من تاريخ الإصدار.'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetadata = async () => {
      const [cRes, sRes] = await Promise.all([
        apiRequest<Client[]>('/clients'),
        apiRequest<Service[]>('/services'),
      ]);
      if (cRes.success && cRes.data) {
        setClients(cRes.data);
        if (cRes.data.length > 0) setSelectedClientId(cRes.data[0].id);
      }
      if (sRes.success && sRes.data) setServices(sRes.data);
    };
    loadMetadata();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { serviceId: '', description: '', quantity: 1, unitPrice: 0, discount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    const updated = [...items];
    if (service) {
      updated[index] = {
        ...updated[index],
        serviceId: service.id,
        description: `${service.nameAr} - ${service.nameEn}`,
        unitPrice: Number(service.defaultPrice),
      };
    } else {
      updated[index] = {
        ...updated[index],
        serviceId: '',
      };
    }
    setItems(updated);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const total = item.quantity * item.unitPrice - (item.discount || 0);
    return acc + Math.max(0, total);
  }, 0);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatAmount = (taxableAmount * taxRate) / 100;
  const whtAmount = applyWht ? (taxableAmount * 1) / 100 : 0;
  const totalAmount = taxableAmount + vatAmount - whtAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedClientId) {
      setError('يرجى اختيار العميل أولاً');
      return;
    }

    const invalidItem = items.find((i) => !i.description || i.unitPrice <= 0 || i.quantity <= 0);
    if (invalidItem) {
      setError('يرجى التأكد من كتابة وصف البند وسعر الوحدة والكمية بشكل صحيح');
      return;
    }

    setLoading(true);

    const payload = {
      clientId: selectedClientId,
      dueDate,
      items: items.map((i) => ({
        serviceId: i.serviceId || undefined,
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount) || 0,
      })),
      discountAmount: Number(discountAmount) || 0,
      taxRate: Number(taxRate) || 0,
      applyWht,
      notes,
      terms,
    };

    const res = await apiRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.success && res.data) {
      navigate(`/invoices/${res.data.id}`);
    } else {
      setError(res.message || 'حدث خطأ أثناء حفظ الفاتورة');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">إنشاء فاتورة جديدة</h1>
          <p className="text-xs text-neutral-500 mt-1">
            سيتم حفظ الفاتورة كمسودة (Draft) لتتمكن من مراجعتها وتقديمها لمسار الاعتماد المالي
          </p>
        </div>
        <button
          onClick={() => navigate('/invoices')}
          className="text-xs font-bold text-neutral-600 hover:text-neutral-900 px-4 py-2 rounded-xl bg-neutral-100"
        >
          إلغاء والعودة
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h2 className="font-extrabold text-sm text-neutral-900 border-b border-neutral-100 pb-3">
            1. بيانات العميل وتواريخ الفاتورة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                العميل <span className="text-[#DC2626]">*</span>
              </label>
              <select
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#DC2626]"
              >
                <option value="">-- اختر العميل --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''} - س.ض: {c.taxNumber || 'غير مسجل'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                تاريخ الاستحقاق <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>
        </div>

        {/* Invoice Items Card */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h2 className="font-extrabold text-sm text-neutral-900">2. بنود الخدمات والأسعار</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>إضافة بند جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* Service Template Quick Select */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      الخدمة (اختياري)
                    </label>
                    <select
                      value={item.serviceId}
                      onChange={(e) => handleServiceSelect(idx, e.target.value)}
                      className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                    >
                      <option value="">-- خدمة مخصصة --</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nameAr} ({s.defaultPrice} ج.م)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      وصف البند التفصيلي <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="وصف الخدمة أو التسليمات..."
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">الكمية</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs text-center"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                      سعر الوحدة (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-xs text-end"
                    />
                  </div>

                  {/* Item Total & Remove */}
                  <div className="md:col-span-2 flex items-center justify-between gap-2">
                    <div className="text-end">
                      <div className="text-[10px] text-neutral-400 font-bold">الإجمالي</div>
                      <div className="text-xs font-black text-neutral-900">
                        {(item.quantity * item.unitPrice - (item.discount || 0)).toLocaleString()}{' '}
                        ج.م
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="حذف البند"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Taxes & Calculation Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes & Terms */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-neutral-900 border-b border-neutral-100 pb-3">
              3. الملاحظات والشروط
            </h2>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">ملاحظات الفاتورة</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات تظهر للعميل أو الإدارة..."
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-[#DC2626]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">الشروط والأحكام</label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>

          {/* Financial Totals */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#DC2626]" />
              <span>4. ملخص الحسابات والضرائب المصرية</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span>المجموع الفرعي للخدمات:</span>
                <span className="font-bold text-neutral-900">{subtotal.toLocaleString()} ج.م</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-600">خصم تجاري عام:</span>
                <div className="w-32">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full p-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-end font-bold text-xs"
                  />
                </div>
              </div>

              {/* VAT 14% */}
              <div className="flex items-center justify-between text-neutral-600">
                <div className="flex items-center gap-2">
                  <span>ضريبة القيمة المضافة (VAT):</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-14 p-1 bg-neutral-50 border border-neutral-200 rounded text-center text-[11px]"
                  />
                  <span>%</span>
                </div>
                <span className="font-bold text-neutral-900">+{vatAmount.toLocaleString()} ج.م</span>
              </div>

              {/* Withholding Tax Toggle (1% WHT) */}
              <div className="flex items-center justify-between text-neutral-600 border-t border-neutral-100 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyWht}
                    onChange={(e) => setApplyWht(e.target.checked)}
                    className="rounded text-[#DC2626] focus:ring-0"
                  />
                  <span className="font-semibold text-neutral-700">
                    تطبيق ضريبة الخصم والإضافة (1% WHT)
                  </span>
                </label>
                <span className="font-bold text-red-600">
                  {applyWht ? `-${whtAmount.toLocaleString()} ج.م` : '0 ج.م'}
                </span>
              </div>

              {/* Total Final */}
              <div className="border-t-2 border-neutral-900 pt-3 flex items-center justify-between">
                <span className="text-sm font-black text-neutral-900">الإجمالي المستحق على العميل:</span>
                <span className="text-xl font-black text-[#DC2626]">
                  {totalAmount.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-neutral-300 text-white font-extrabold rounded-2xl shadow-lg shadow-red-900/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>جاري حفظ الفاتورة...</span>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>حفظ كمسودة ومتابعة</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
