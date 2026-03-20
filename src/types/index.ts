export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  fonction?: string;
  address: string;
  phone: string;
  email: string;
  nif: string; // Numéro d'Identification Fiscale
  carteAutoentrepreneur?: string;
  socialSecurity?: string;
  bankAccount?: string;
  signatureUrl?: string;
  stampUrl?: string;
  appIconUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  nif?: string;
  nis?: string; // Numéro d'Identification Statistique
  bankAccount?: string;
}

export interface InvoiceItem {
  description: string;
  unit: 'day' | 'week';
  quantity: number; // For weeks + days, we can handle it in the UI
  pricePerUnit: number;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'partial';
export type DocumentType = 'invoice' | 'quote';

export interface Invoice {
  id: string;
  type: DocumentType;
  invoiceNumber: string;
  date: string; // ISO string
  projectName: string;
  clientId: string;
  technicianId: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  taxRate: number; // 0.5% or 0
  paidAmount: number;
  showSignature: boolean;
  showStamp: boolean;
  totalDays: number;
  subTotal: number;
  total: number;
  notes?: string;
}

export interface UserProfile extends Technician {
  pinCode?: string;
}
