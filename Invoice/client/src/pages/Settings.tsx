import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { ApprovalRule, UserRole } from '../types/index.js';
import { Sliders, Plus, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Settings: React.FC = () => {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN']);

  const fetchRules = async () => {
    setLoading(true);
    const res = await apiRequest<ApprovalRule[]>('/settings/approval-rules');
    if (res.success && res.data) {
      setRules(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleRuleChange = (index: number, field: string, val: any) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: val };
    setRules(updated);
  };

  const handleAddTier = () => {
    const lastRule = rules[rules.length - 1];
    const newMin = lastRule ? Number(lastRule.maxAmount) + 0.01 : 0;
    const newMax = newMin + 50000;

    setRules([
      ...rules,
      {
        id: `temp-${Date.now()}`,
        levelOrder: rules.length + 1,
        minAmount: newMin,
        maxAmount: newMax,
        requiredRole: 'ADMIN',
        description: `المستوى ${rules.length + 1}`,
        isActive: true,
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (rules.length <= 1) return;
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate non-overlapping
    const sorted = [...rules].sort((a, b) => Number(a.minAmount) - Number(b.minAmount));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (Number(sorted[i].maxAmount) >= Number(sorted[i + 1].minAmount)) {
        setMessage({
          type: 'error',
          text: `خطأ في النطاق: الحدود المالية بين المستوى ${i + 1} والمستوى ${
            i + 2
          } متداخلة (${sorted[i].maxAmount} ج.م >= ${sorted[i + 1].minAmount} ج.م)`,
        });
        return;
      }
    }

    setSaving(true);
    const res = await apiRequest('/settings/approval-rules', {
      method: 'PUT',
      body: JSON.stringify(
        sorted.map((r, i) => ({
          levelOrder: i + 1,
          minAmount: Number(r.minAmount),
          maxAmount: Number(r.maxAmount),
          requiredRole: r.requiredRole,
          description: r.description,
        }))
      ),
    });
    setSaving(false);

    if (res.success && res.data) {
      setRules(res.data);
      setMessage({
        type: 'success',
        text: 'تم حفظ وتحديث قواعد وحدود الاعتماد المالية بنجاح في قاعدة البيانات',
      });
    } else {
      setMessage({
        type: 'error',
        text: res.message || 'حدث خطأ أثناء حفظ الإعدادات',
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-12 text-center text-red-500 font-bold bg-white rounded-3xl border border-neutral-200">
        هذه الصفحة مخصصة لمدير النظام (Admin) فقط لتعديل حدود الاعتماد المالية.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
            <span className="text-xs font-bold text-red-600">إعدادات الصلاحيات والحدود المالية</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            حدود مستويات الاعتماد (approval_rules)
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            يتم تخزين هذه النطاقات في قاعدة البيانات (وليس في الكود). يتم التحقق برمجياً من عدم وجود أي تداخلات مالية لضمان تغطية جميع قيم الفواتير.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddTier}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all self-start"
        >
          <Plus className="w-4 h-4 text-[#DC2626]" />
          <span>إضافة مستوى جديد</span>
        </button>
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

      {/* Rules Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-sm text-neutral-900">
                      المستوى رقم {idx + 1}
                    </span>
                  </div>
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="text-neutral-400 hover:text-red-600 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف المستوى</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-600 mb-1">
                      الحد الأدنى للقيمة (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={rule.minAmount}
                      onChange={(e) => handleRuleChange(idx, 'minAmount', Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 mb-1">
                      الحد الأقصى للقيمة (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={rule.maxAmount}
                      onChange={(e) => handleRuleChange(idx, 'maxAmount', Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 mb-1">
                      الرتبة المعتمدة المطلوبة
                    </label>
                    <select
                      value={rule.requiredRole}
                      onChange={(e) => handleRuleChange(idx, 'requiredRole', e.target.value)}
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl font-bold"
                    >
                      <option value="ACCOUNTANT">محاسب (Accountant)</option>
                      <option value="FINANCE_MANAGER">مدير مالي (Finance Manager)</option>
                      <option value="ADMIN">مدير النظام (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 mb-1">وصف النطاق</label>
                    <input
                      type="text"
                      value={rule.description || ''}
                      onChange={(e) => handleRuleChange(idx, 'description', e.target.value)}
                      placeholder="مثال: فواتير الحملات الصغيرة"
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              * سيتم فحص عدم التداخل وتسلسل النطاقات تلقائياً قبل الحفظ.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-neutral-300 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ الحدود والتحديث'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
