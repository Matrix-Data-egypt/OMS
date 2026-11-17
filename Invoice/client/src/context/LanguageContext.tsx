import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    system_name: 'OMS Invoice',
    company_name: 'شركة OMS',
    developer_badge: 'تطوير وتنفيذ: MDE – Matrix Data Egypt',
    dashboard: 'لوحة التحكم',
    invoices: 'الفواتير',
    clients: 'العملاء',
    services: 'الخدمات',
    approvals: 'الاعتمادات',
    payments: 'المدفوعات',
    reports: 'التقارير المالية',
    settings: 'حدود الاعتماد والإعدادات',
    logout: 'تسجيل الخروج',
    new_invoice: 'إنشاء فاتورة جديدة',
    currency: 'ج.م',
    status_draft: 'مسودة',
    status_pending: 'بانتظار الاعتماد',
    status_approved: 'معتمدة',
    status_issued: 'مصدرة للعميل',
    status_partially_paid: 'مسددة جزئياً',
    status_paid: 'مسددة بالكامل',
    status_cancelled: 'ملغاة',
    overdue_badge: 'متأخرة في السداد',
    submit_approval: 'إرسال للاعتماد',
    approve: 'اعتماد الفاتورة',
    reject: 'رفض الفاتورة',
    send_invoice: 'إرسال الفاتورة',
    record_payment: 'تسجيل دفعة',
    print_pdf: 'طباعة / تصدير PDF',
  },
  en: {
    system_name: 'OMS Invoice',
    company_name: 'OMS Company',
    developer_badge: 'Developed by MDE – Matrix Data Egypt',
    dashboard: 'Dashboard',
    invoices: 'Invoices',
    clients: 'Clients',
    services: 'Services',
    approvals: 'Approvals',
    payments: 'Payments',
    reports: 'Financial Reports',
    settings: 'Approval Rules & Settings',
    logout: 'Logout',
    new_invoice: 'Create New Invoice',
    currency: 'EGP',
    status_draft: 'Draft',
    status_pending: 'Pending Approval',
    status_approved: 'Approved',
    status_issued: 'Issued',
    status_partially_paid: 'Partially Paid',
    status_paid: 'Paid in Full',
    status_cancelled: 'Cancelled',
    overdue_badge: 'Overdue',
    submit_approval: 'Submit for Approval',
    approve: 'Approve Invoice',
    reject: 'Reject Invoice',
    send_invoice: 'Send Invoice',
    record_payment: 'Record Payment',
    print_pdf: 'Print / Export PDF',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('oms_lang') as Language) || 'ar';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('oms_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
