import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import { History, ShieldAlert, User, Clock } from 'lucide-react';

interface AuditLogItem {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  details?: string;
  createdAt: string;
  performedBy?: {
    name: string;
    role: string;
    email: string;
  };
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const res = await apiRequest<AuditLogItem[]>('/reports/audit-logs');
      if (res.success && res.data) {
        setLogs(res.data);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">سجل تدقيق العمليات (Audit Trail)</h1>
        <p className="text-xs text-neutral-500 mt-1">
          توثيق كامل ودقيق لكل عمليات الإنشاء، الاعتماد، إلغاء الاعتمادات، وتسجيل الدفعات والإرسال
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
              <tr>
                <th className="p-4 text-start">الوقت والتاريخ</th>
                <th className="p-4 text-start">المستخدم المسؤول</th>
                <th className="p-4 text-start">نوع الكيان</th>
                <th className="p-4 text-start">نوع الإجراء</th>
                <th className="p-4 text-start">التفاصيل الكاملة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-bold">
                    جاري تحميل سجل التدقيق...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-400 font-bold">
                    لا توجد سجلات مسجلة بعد.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="p-4 text-neutral-500 font-medium whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-neutral-900">{log.performedBy?.name || 'النظام'}</div>
                      <div className="text-[10px] text-neutral-400">{log.performedBy?.role}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-neutral-100 text-neutral-700 text-[10px]">
                        {log.entity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                          log.action.includes('VOID')
                            ? 'bg-rose-100 text-rose-800'
                            : log.action.includes('APPROVE')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-700 font-medium max-w-md">
                      {log.details || '-'}
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
