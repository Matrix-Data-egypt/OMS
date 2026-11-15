import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { apiRequest } from '../services/api.js';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.success && res.data) {
      login(res.data.token, res.data.user);
      navigate('/');
    } else {
      setError(res.message || 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور');
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Oms@123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#171717] rounded-3xl border border-neutral-800 shadow-2xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#DC2626] mx-auto flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-red-900/50">
            OMS
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide"> OMS Invoice</h1>
          <p className="text-xs text-neutral-400 font-medium">
             OMS invoice
          </p>
          <div className="inline-block px-3 py-1 bg-red-950/40 border border-red-800/40 rounded-full text-[11px] font-semibold text-red-300">
           power by :  Matrix Data Egypt
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute top-3.5 start-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@oms.com"
                className="w-full ps-10 pe-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#DC2626] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute top-3.5 start-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-10 pe-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#DC2626] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-neutral-800 text-white font-extrabold rounded-xl shadow-lg shadow-red-900/30 transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <span>تسجيل الدخول للنظام</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-neutral-800 space-y-2">
          <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>حسابات تجريبية لاختبار الصلاحيات ومسار الاعتماد:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoAccount('admin@oms.com')}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-start transition-colors"
            >
              <div className="font-bold text-white text-[11px]">Admin</div>
              <div className="text-[10px] text-neutral-500">مدير النظام</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('finance@oms.com')}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-start transition-colors"
            >
              <div className="font-bold text-white text-[11px]">Finance Manager</div>
              <div className="text-[10px] text-neutral-500">مدير مالي</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('accountant@oms.com')}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-start transition-colors"
            >
              <div className="font-bold text-white text-[11px]">Accountant</div>
              <div className="text-[10px] text-neutral-500">محاسب (إنشاء)</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('sales@oms.com')}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-start transition-colors"
            >
              <div className="font-bold text-white text-[11px]">Sales</div>
              <div className="text-[10px] text-neutral-500">مبيعات (عملاء فقط)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
