import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export const STATUS_OPTIONS = [
  { value: 'new', label: 'New (جديد)', icon: '🆕' },
  { value: 'in_review', label: 'In Review (قيد المراجعة)', icon: '⏳' },
  { value: 'contacted', label: 'Contacted (تم التواصل)', icon: '📞' },
  { value: 'closed', label: 'Closed (مغلق)', icon: '🏁' },
];

export const NEXT_STAGE_MAP = {
  new: {
    next: 'in_review',
    label: 'بدء المراجعة ❯',
    shortLabel: 'نقل للمراجعة ❯',
    title: 'نقل الطلب لمرحلة قيد المراجعة',
    btnBg: 'rgba(59, 130, 246, 0.18)',
    btnColor: '#60a5fa',
    btnBorder: 'rgba(59, 130, 246, 0.4)',
  },
  in_review: {
    next: 'contacted',
    label: 'تم التواصل مع العميل ❯',
    shortLabel: 'تم التواصل ❯',
    title: 'تأكيد التواصل ونقله إلى تم التواصل',
    btnBg: 'rgba(16, 185, 129, 0.18)',
    btnColor: '#34d399',
    btnBorder: 'rgba(16, 185, 129, 0.4)',
  },
  contacted: {
    next: 'closed',
    label: 'إغلاق الطلب (إنهاء) ❯',
    shortLabel: 'إغلاق الطلب ❯',
    title: 'إنهاء المعاملة وتصنيف الطلب كمغلق',
    btnBg: 'rgba(232, 163, 23, 0.18)',
    btnColor: '#fbbf24',
    btnBorder: 'rgba(232, 163, 23, 0.4)',
  },
  closed: {
    next: 'new',
    label: 'إعادة فتح الطلب ↺',
    shortLabel: 'إعادة فتح ↺',
    title: 'إعادة فتح الطلب من جديد',
    btnBg: 'rgba(139, 155, 176, 0.18)',
    btnColor: '#94a3b8',
    btnBorder: 'rgba(139, 155, 176, 0.4)',
  },
};

export default function Briefs() {
  const { isAdmin, isManager, isSales } = useAuth();
  const [briefs, setBriefs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api('/api/briefs');
      setBriefs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    if (isManager) return; // Manager is strictly read-only
    setUpdatingId(id);
    try {
      const updated = await api(`/api/briefs/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setBriefs((list) => list.map((b) => (b.id === id ? updated : b)));
      if (selected?.id === id) setSelected(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const advanceNextStage = (b) => {
    const nextConfig = NEXT_STAGE_MAP[b.status];
    if (nextConfig) {
      updateStatus(b.id, nextConfig.next);
    }
  };

  const remove = async (id) => {
    if (!isAdmin) return; // Only admin can delete
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    try {
      await api(`/api/briefs/${id}`, { method: 'DELETE' });
      setBriefs((list) => list.filter((b) => b.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Counts for each category
  const countAll = briefs.length;
  const countNew = briefs.filter((b) => b.status === 'new').length;
  const countInReview = briefs.filter((b) => b.status === 'in_review').length;
  const countContacted = briefs.filter((b) => b.status === 'contacted').length;
  const countClosed = briefs.filter((b) => b.status === 'closed').length;

  const tabs = [
    { id: 'all', label: 'جميع الطلبات', count: countAll, icon: '📋' },
    { id: 'new', label: 'جديد (New)', count: countNew, icon: '🆕' },
    { id: 'in_review', label: 'قيد المراجعة (In Review)', count: countInReview, icon: '⏳' },
    { id: 'contacted', label: 'تم التواصل (Contacted)', count: countContacted, icon: '📞' },
    { id: 'closed', label: 'مغلق (Closed)', count: countClosed, icon: '🏁' },
  ];

  // Filtered briefs according to activeTab
  const filteredBriefs =
    activeTab === 'all' ? briefs : briefs.filter((b) => b.status === activeTab);

  // Stepper helper for modal
  const getStepIndex = (status) => {
    switch (status) {
      case 'new': return 0;
      case 'in_review': return 1;
      case 'contacted': return 2;
      case 'closed': return 3;
      default: return 0;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Start Project — تصنيف ومتابعة طلبات العملاء</h1>
            {isSales && (
              <span className="badge badge-sales">فريق المبيعات (Sales)</span>
            )}
            {isManager && (
              <span className="badge badge-manager">عرض فقط (Read Only)</span>
            )}
          </div>
          <p>
            تتبع مراحل العملاء خطوة بخطوة من وصول الطلب (جديد) مروراً بالمراجعة والتواصل حتى الإغلاق التام.
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          تحديث ↺
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* 📊 بطاقات الإحصائيات السريعة ومراحل المتابعة */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div
          onClick={() => setActiveTab('new')}
          style={{
            cursor: 'pointer',
            background: activeTab === 'new' ? 'rgba(232, 163, 23, 0.15)' : 'var(--bg-card)',
            border: activeTab === 'new' ? '2px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>1. طلبات جديدة</span>
            <span style={{ fontSize: '18px' }}>🆕</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
            {countNew}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            بانتظار البدء والمراجعة
          </div>
        </div>

        <div
          onClick={() => setActiveTab('in_review')}
          style={{
            cursor: 'pointer',
            background: activeTab === 'in_review' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
            border: activeTab === 'in_review' ? '2px solid #3b82f6' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>2. قيد المراجعة</span>
            <span style={{ fontSize: '18px' }}>⏳</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#60a5fa', marginTop: '6px' }}>
            {countInReview}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            يتم فحص التفاصيل والتجهيز
          </div>
        </div>

        <div
          onClick={() => setActiveTab('contacted')}
          style={{
            cursor: 'pointer',
            background: activeTab === 'contacted' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
            border: activeTab === 'contacted' ? '2px solid #10b981' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>3. تم التواصل</span>
            <span style={{ fontSize: '18px' }}>📞</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#34d399', marginTop: '6px' }}>
            {countContacted}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            تم التحدث عبر واتساب / إيميل
          </div>
        </div>

        <div
          onClick={() => setActiveTab('closed')}
          style={{
            cursor: 'pointer',
            background: activeTab === 'closed' ? 'rgba(148, 163, 184, 0.15)' : 'var(--bg-card)',
            border: activeTab === 'closed' ? '2px solid #94a3b8' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>4. منتهية / مغلقة</span>
            <span style={{ fontSize: '18px' }}>🏁</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#94a3b8', marginTop: '6px' }}>
            {countClosed}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            تم إتمام الطلب بنجاح
          </div>
        </div>
      </div>

      {/* 🏷️ أزرار التبويبات الفئوية (Category Tabs) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: isActive ? 'var(--accent-soft)' : 'var(--bg-card)',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#000' : 'inherit',
                  padding: '1px 7px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 📋 جدول الطلبات المصنفة */}
      <div className="card">
        {loading ? (
          <div className="empty">جاري تحميل الطلبات…</div>
        ) : filteredBriefs.length === 0 ? (
          <div className="empty">
            {activeTab === 'all'
              ? 'لا توجد طلبات مشاريع حتى الآن.'
              : `لا توجد طلبات في تصنيف "${tabs.find((t) => t.id === activeTab)?.label}".`}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>العميل / التواصل</th>
                <th>اسم الشركة</th>
                <th>هدف الحملة</th>
                <th>القطاع</th>
                <th>الحالة الحالية</th>
                <th>التاريخ</th>
                <th>تسلسل المرحلة (Workflow)</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredBriefs.map((b) => {
                const nextCfg = NEXT_STAGE_MAP[b.status];
                const isBusy = updatingId === b.id;

                return (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.fullName}</strong>
                      <div className="meta" style={{ direction: 'ltr', textAlign: 'right' }}>
                        {b.phone} • {b.email}
                      </div>
                    </td>
                    <td><strong>{b.companyName}</strong></td>
                    <td>{b.objective}</td>
                    <td>{b.sector}</td>
                    <td>
                      <span className={`badge badge-${b.status}`}>
                        {STATUS_OPTIONS.find((s) => s.value === b.status)?.label || b.status}
                      </span>
                    </td>
                    <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    
                    {/* 🚀 زر الانتقال السريع للمرحلة التالية */}
                    <td>
                      {!isManager ? (
                        b.status === 'closed' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>
                              ✓ مكتمل
                            </span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--muted)' }}
                              onClick={() => updateStatus(b.id, 'new')}
                              title="إعادة فتح الطلب"
                              disabled={isBusy}
                            >
                              ↺ إعادة فتح
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm"
                            disabled={isBusy}
                            title={nextCfg?.title}
                            onClick={() => advanceNextStage(b)}
                            style={{
                              background: nextCfg?.btnBg,
                              color: nextCfg?.btnColor,
                              border: `1px solid ${nextCfg?.btnBorder}`,
                              fontWeight: 600,
                              fontSize: '12px',
                              padding: '4px 10px',
                              whiteSpace: 'nowrap',
                              borderRadius: '6px',
                            }}
                          >
                            {isBusy ? 'جاري النقل…' : nextCfg?.shortLabel}
                          </button>
                        )
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>مشاهدة فقط</span>
                      )}
                    </td>

                    {/* الإجراءات العامة */}
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelected(b)}
                        >
                          عرض وتواصل
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => remove(b.id)}
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔍 نافذة التفاصيل والمتابعة (Modal) */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>تفاصيل طلب المشروع (Project Brief)</h2>
              <span className={`badge badge-${selected.status}`}>
                {STATUS_OPTIONS.find((s) => s.value === selected.status)?.label || selected.status}
              </span>
            </div>

            {/* 🚦 مسار تقدم مراحل الطلب (Workflow Stepper) */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', marginBottom: '12px' }}>
                مراحل دورة حياة الطلب (Workflow Progress):
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                }}
              >
                {STATUS_OPTIONS.map((step, idx) => {
                  const currentIdx = getStepIndex(selected.status);
                  const isCurrent = currentIdx === idx;
                  const isDone = currentIdx > idx;

                  return (
                    <div
                      key={step.value}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        background: isCurrent
                          ? 'rgba(232, 163, 23, 0.18)'
                          : isDone
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(255,255,255,0.02)',
                        border: isCurrent
                          ? '1px solid var(--accent)'
                          : isDone
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid var(--border)',
                        color: isCurrent
                          ? 'var(--accent)'
                          : isDone
                            ? '#34d399'
                            : 'var(--muted)',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 700 : 500,
                      }}
                    >
                      <div style={{ fontSize: '14px', marginBottom: '3px' }}>
                        {isDone ? '✓' : step.icon}
                      </div>
                      <div>{step.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* زر النقل المباشر للمرحلة التالية داخل النافذة */}
              {!isManager && (
                <div
                  style={{
                    marginTop: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    المرحلة القادمة الموصى بها:
                  </span>
                  {selected.status === 'closed' ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => updateStatus(selected.id, 'new')}
                    >
                      ↺ إعادة فتح الطلب
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => advanceNextStage(selected)}
                      style={{
                        background: NEXT_STAGE_MAP[selected.status]?.btnBg,
                        color: NEXT_STAGE_MAP[selected.status]?.btnColor,
                        border: `1px solid ${NEXT_STAGE_MAP[selected.status]?.btnBorder}`,
                        fontWeight: 700,
                        padding: '6px 14px',
                      }}
                    >
                      {NEXT_STAGE_MAP[selected.status]?.label}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid-2">
              <div className="field">
                <label>اسم العميل (Full Name)</label>
                <input value={selected.fullName} readOnly />
              </div>
              <div className="field">
                <label>الشركة (Company)</label>
                <input value={selected.companyName} readOnly />
              </div>
              <div className="field">
                <label>البريد الإلكتروني (Email)</label>
                <input value={selected.email} readOnly />
              </div>
              <div className="field">
                <label>الهاتف / واتساب (Phone)</label>
                <input value={selected.phone} readOnly />
              </div>
              <div className="field">
                <label>هدف الحملة (Campaign Objective)</label>
                <input value={selected.objective} readOnly />
              </div>
              <div className="field">
                <label>قطاع النشاط (Industry Sector)</label>
                <input value={selected.sector} readOnly />
              </div>
            </div>

            <div className="field">
              <label>ملخص المشروع والتحديات (Project Summary)</label>
              <textarea value={selected.summary} readOnly rows={4} />
            </div>

            <div className="field">
              <label>
                تغيير يدوي للحالة (Manual Status Override)
                {isManager && (
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginRight: '6px' }}>
                    (وضع المشاهدة فقط - غير متاح للتعديل)
                  </span>
                )}
              </label>
              <select
                value={selected.status}
                disabled={isManager}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                style={{ opacity: isManager ? 0.7 : 1 }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Communication Channels for Sales & Admin */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '10px',
                padding: '14px 18px',
                margin: '18px 0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.88rem' }}>
                📞 قنوات التواصل المباشر مع العميل:
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  className="btn btn-primary btn-sm"
                  href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: '#25D366', borderColor: '#25D366', color: '#fff' }}
                >
                  💬 فتح واتساب (WhatsApp)
                </a>
                <a 
                  className="btn btn-ghost btn-sm" 
                  href={`mailto:${selected.email}?subject=Regarding Your OMS Project Brief (${encodeURIComponent(selected.companyName)})`}
                >
                  ✉️ إرسال بريد (Email)
                </a>
                <a 
                  className="btn btn-ghost btn-sm" 
                  href={`tel:${selected.phone}`}
                >
                  📱 اتصال هاتفي
                </a>
              </div>
            </div>

            <div className="modal-actions">
              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => remove(selected.id)}
                  style={{ marginRight: 'auto' }}
                >
                  حذف الطلب
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setSelected(null)}>
                إغلاق (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
