export type PaymentProvider = "stripe" | "payhere" | "paypal";
export type PaymentPurpose = "appointment" | "medicine" | "subscription" | "donation";

export interface PaymentRecord {
  _id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  purpose: PaymentPurpose;
  status: string;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  plan: string;
  provider: PaymentProvider;
  status: string;
  amount: number;
  currentPeriodEnd?: string;
}
