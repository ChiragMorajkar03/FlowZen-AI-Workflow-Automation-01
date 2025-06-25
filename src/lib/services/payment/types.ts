export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  description: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiry?: string;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  pdfUrl?: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  plan: SubscriptionPlan;
  cancelAtPeriodEnd: boolean;
}

export interface IPaymentService {
  getPlans(): Promise<SubscriptionPlan[]>;
  getSubscription(): Promise<Subscription | null>;
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getInvoices(): Promise<Invoice[]>;
  createSubscription(planId: string, paymentMethodId?: string): Promise<Subscription>;
  cancelSubscription(): Promise<void>;
  updatePaymentMethod(paymentMethodId: string): Promise<void>;
  createPaymentMethod(paymentMethod: any): Promise<PaymentMethod>;
} 