import React from 'react';
import { ExternalLink, Video, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="bg-[#171717] text-white border-b border-neutral-800 sticky top-0 z-50 px-4 lg:px-8 py-3.5 shadow-md">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-900/40">
            OMS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wide text-white">OMS MEDIA</span>
              <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                قسم الميديا والإعلانات
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              تطوير وتنفيذ: <span className="text-white font-semibold">MDE – Matrix Data Egypt</span>
            </p>
          </div>
        </div>

        {/* Quick Link to Accounting System */}
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition-colors"
            title="الانتقال إلى نظام المحاسبة والفواتير"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#DC2626]" />
            <span>نظام المحاسبة والفواتير</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
