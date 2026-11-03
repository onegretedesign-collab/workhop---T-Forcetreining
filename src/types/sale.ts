export type PaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'cash'
  | 'bank_transfer'
  | 'complimentary';

export type SaleStatus = 'confirmed' | 'pending' | 'cancelled';

export interface SaleRecord {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  cpf?: string;
  ticketType: string;
  attendeesCount: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  origin: 'online' | 'manual';
  createdAt: string;
  updatedAt?: string;
}

export interface SaleFormData {
  customerName: string;
  email: string;
  phone: string;
  cpf: string;
  ticketType: string;
  attendeesCount: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes: string;
}
