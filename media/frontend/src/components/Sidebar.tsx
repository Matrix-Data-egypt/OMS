import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Truck,
  Tv,
  Layers,
  FileVideo,
  Receipt,
  PlusCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    {
      to: '/',
      label: 'لوحة التحكم والبحث (Dashboard)',
      icon: LayoutDashboard,
    },
    {
      to: '/clients',
      label: 'العملاء (Clients)',
      icon: Users,
    },
    {
      to: '/suppliers',
      label: 'الموردين (Suppliers)',
      icon: Truck,
    },
    {
      to: '/channels',
      label: 'القنوات الإعلانية (Channels)',
      icon: Tv,
    },
    {
      to: '/content-types',
      label: 'أنواع المحتوى (Content Types)',
      icon: Layers,
    },
    {
      to: '/contents',
      label: 'المحتوى (Content)',
      icon: FileVideo,
    },
    {
      to: '/accounting-sync',
      label: 'الربط مع قسم المحاسبة',
      icon: Receipt,
    },
  ];

  return (
    <aside className="w-64 bg-white border-e border-neutral-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-4 space-y-4">
        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-50 text-[#DC2626] border-s-4 border-[#DC2626]'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-neutral-200 text-center">
        <div className="text-[11px] text-neutral-400 font-semibold">
          نظام إدارة الميديا v1.0
        </div>
        <div className="text-[10px] text-neutral-500 mt-0.5">
          تنفيذ <span className="text-[#DC2626] font-bold">MDE – Matrix Data Egypt</span>
        </div>
      </div>
    </aside>
  );
};
