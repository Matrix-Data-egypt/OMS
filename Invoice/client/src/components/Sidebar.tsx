import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  CheckCircle2,
  CreditCard,
  BarChart3,
  Sliders,
  History,
  PlusCircle,
} from 'lucide-react';
import { UserRole } from '../types/index.js';

interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

export const Sidebar: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    {
      to: '/',
      labelKey: 'dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/invoices',
      labelKey: 'invoices',
      icon: FileText,
    },
    {
      to: '/approvals',
      labelKey: 'approvals',
      icon: CheckCircle2,
      roles: ['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'],
    },
    {
      to: '/payments',
      labelKey: 'payments',
      icon: CreditCard,
      roles: ['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'],
    },
    {
      to: '/clients',
      labelKey: 'clients',
      icon: Users,
    },
    {
      to: '/services',
      labelKey: 'services',
      icon: Briefcase,
      roles: ['ADMIN', 'FINANCE_MANAGER'],
    },
    {
      to: '/reports',
      labelKey: 'reports',
      icon: BarChart3,
      roles: ['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT'],
    },
    {
      to: '/audit-logs',
      labelKey: 'عرض سجل العمليات',
      icon: History,
      roles: ['ADMIN', 'FINANCE_MANAGER'],
    },
    {
      to: '/settings',
      labelKey: 'settings',
      icon: Sliders,
      roles: ['ADMIN'],
    },
  ];

  return (
    <aside className="w-64 bg-white border-e border-neutral-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-4 space-y-4">
        {/* Quick Create Invoice CTA */}
        {hasRole(['ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT']) && (
          <NavLink
            to="/invoices/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl shadow-md shadow-red-600/20 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('new_invoice')}</span>
          </NavLink>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.roles && !hasRole(item.roles)) {
              return null;
            }

            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-red-50 text-[#DC2626] border-s-4 border-[#DC2626]'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-neutral-200 text-center">
        <div className="text-[11px] text-neutral-400 font-semibold">
          نظام OMS Invoice  v1.0
        </div>
        <div className="text-[10px] text-neutral-500 mt-0.5">
          Power by:<span className="text-[#DC2626] font-bold"> Matrix Data Egypt</span>
        </div>
      </div>
    </aside>
  );
};
