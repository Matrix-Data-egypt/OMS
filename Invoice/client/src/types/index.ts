export type UserRole = 'ADMIN' | 'FINANCE_MANAGER' | 'ACCOUNTANT' | 'SALES';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  taxNumber?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  defaultPrice: number;
  defaultTaxRate: number;
}

export type InvoiceStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';

export interface InvoiceItem {
  id?: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  service?: Service;
}

export interface InvoiceTax {
  id: string;
  taxName: string;
  taxRate: number;
  taxAmount: number;
  isWithholding: boolean;
}

export interface ApprovalStep {
  id: string;
  levelOrder: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  actionDate?: string;
  approver?: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'ONLINE';
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  recordedBy?: {
    name: string;
  };
}

export interface DeliveryLog {
  id: string;
  channel: 'PDF' | 'EMAIL' | 'WHATSAPP';
  recipient: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  retryCount: number;
  sentAt?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    role: UserRole;
    email: string;
  };
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  currency: string;
  notes?: string;
  terms?: string;
  items?: InvoiceItem[];
  taxes?: InvoiceTax[];
  approvalSteps?: ApprovalStep[];
  payments?: Payment[];
  deliveryLogs?: DeliveryLog[];
  isOverdue?: boolean;
  daysOverdue?: number;
  createdAt: string;
}

export interface ApprovalRule {
  id: string;
  levelOrder: number;
  minAmount: number;
  maxAmount: number;
  requiredRole: UserRole;
  description?: string;
  isActive: boolean;
}

export interface FinancialOverview {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  overdueCount: number;
  draftCount: number;
  pendingApprovalCount: number;
  paidCount: number;
  totalClients: number;
  totalServices: number;
  collectionRate: number;
}
