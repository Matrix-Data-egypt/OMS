export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  role: 'ADMIN' | 'FINANCE_MANAGER' | 'ACCOUNTANT' | 'SALES';
  systemAccess: 'INVOICE' | 'MEDIA' | 'ALL';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  total: number;
  active: number;
  invoiceUsers: number;
  mediaUsers: number;
  allAccessUsers: number;
}
