import { IPaymentService, SubscriptionPlan, PaymentMethod, Invoice, Subscription } from './types';

const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['Basic features', 'Limited usage', 'Community support'],
    description: 'Perfect for getting started'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    interval: 'month',
    features: ['All Free features', 'Advanced analytics', 'Priority support', 'API access'],
    description: 'For growing businesses'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    interval: 'month',
    features: ['All Pro features', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
    description: 'For large organizations'
  }
];

export class MockPaymentService implements IPaymentService {
  private mockPaymentMethods: PaymentMethod[] = [];
  private mockInvoices: Invoice[] = [];
  private mockSubscription: Subscription | null = null;

  async getPlans(): Promise<SubscriptionPlan[]> {
    return MOCK_PLANS;
  }

  async getSubscription(): Promise<Subscription | null> {
    return this.mockSubscription;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.mockPaymentMethods;
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.mockInvoices;
  }

  async createSubscription(planId: string, paymentMethodId?: string): Promise<Subscription> {
    const plan = MOCK_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');

    this.mockSubscription = {
      id: 'sub_mock_' + Date.now(),
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      plan,
      cancelAtPeriodEnd: false
    };

    return this.mockSubscription;
  }

  async cancelSubscription(): Promise<void> {
    if (this.mockSubscription) {
      this.mockSubscription.cancelAtPeriodEnd = true;
    }
  }

  async updatePaymentMethod(paymentMethodId: string): Promise<void> {
    this.mockPaymentMethods.forEach(method => {
      method.isDefault = method.id === paymentMethodId;
    });
  }

  async createPaymentMethod(paymentMethod: any): Promise<PaymentMethod> {
    const newMethod: PaymentMethod = {
      id: 'pm_mock_' + Date.now(),
      type: 'card',
      last4: paymentMethod.card.last4,
      brand: paymentMethod.card.brand,
      expiry: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
      isDefault: this.mockPaymentMethods.length === 0
    };

    this.mockPaymentMethods.push(newMethod);
    return newMethod;
  }
} 