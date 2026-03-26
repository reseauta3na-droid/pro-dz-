export type LegalStatus = 'auto-entrepreneur' | 'registre-commerce';

export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  fonction?: string;
  legalStatus: LegalStatus;
  address: string;
  phone: string;
  email: string;
  nif: string; // Numéro d'Identification Fiscale
  registreCommerce?: string;
  carteAutoentrepreneur?: string;
  socialSecurity?: string;
  bankAccount?: string;
  signatureUrl?: string;
  stampUrl?: string;
  appIconUrl?: string;
  additionalInfo?: string;
  defaultCurrency: Currency;
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
  additionalInfo?: string;
}

export interface InvoiceItem {
  description: string;
  unit: 'day' | 'week' | 'forfait';
  quantity: number; // For weeks + days, we can handle it in the UI
  pricePerUnit: number;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'partial';
export type DocumentType = 'invoice' | 'quote';

export type Currency = 'DZD' | 'EUR' | 'USD';

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: 'equipment' | 'transport' | 'software' | 'fiscal' | 'other';
  amount: number;
  currency: Currency;
  technicianId: string;
}

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
  currency: Currency;
  taxRate: number; // IFU 0.5%
  tvaRate: number; // TVA (e.g. 19% or 9%)
  paidAmount: number;
  showSignature: boolean;
  showStamp: boolean;
  totalDays: number;
  subTotal: number;
  taxAmount: number;
  tvaAmount: number;
  total: number;
  notes?: string;
}

export interface UserProfile extends Technician {
  pinCode?: string;
  role?: 'admin' | 'user';
}

export interface FiscalDeadline {
  id: string;
  title: string;
  type: 'IFU' | 'CASNOS';
  date: string; // MM-DD format
  description: string;
}
