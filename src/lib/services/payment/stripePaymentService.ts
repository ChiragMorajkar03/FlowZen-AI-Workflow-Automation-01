import { IPaymentService, SubscriptionPlan, PaymentMethod, Invoice, Subscription } from './types';
import Stripe from 'stripe';

export class StripePaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16'
    });
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    const products = await this.stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    return products.data.map(product => {
      const price = product.default_price as Stripe.Price;
      return {
        id: price.id,
        name: product.name,
        price: price.unit_amount ? price.unit_amount / 100 : 0,
        interval: price.recurring?.interval as 'month' | 'year',
        features: product.features?.map(f => f.name || '') || [],
        description: product.description || ''
      };
    });
  }

  async getSubscription(): Promise<Subscription | null> {
    // In a real implementation, you would get the customer ID from your user data
    const subscriptions = await this.stripe.subscriptions.list({
      limit: 1,
      status: 'active'
    });

    if (subscriptions.data.length === 0) return null;

    const subscription = subscriptions.data[0];
    const plan = await this.getPlans().then(plans => 
      plans.find(p => p.id === subscription.items.data[0].price.id)
    );

    if (!plan) throw new Error('Plan not found');

    return {
      id: subscription.id,
      status: subscription.status as 'active' | 'canceled' | 'past_due',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      plan,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    };
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // In a real implementation, you would get the customer ID from your user data
    const paymentMethods = await this.stripe.paymentMethods.list({
      type: 'card'
    });

    return paymentMethods.data.map(method => ({
      id: method.id,
      type: method.type as 'card' | 'bank_account',
      last4: method.card?.last4 || '',
      brand: method.card?.brand,
      expiry: method.card ? `${method.card.exp_month}/${method.card.exp_year}` : undefined,
      isDefault: false // You would need to track this separately
    }));
  }

  async getInvoices(): Promise<Invoice[]> {
    // In a real implementation, you would get the customer ID from your user data
    const invoices = await this.stripe.invoices.list({
      limit: 10
    });

    return invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status as 'paid' | 'pending' | 'failed',
      date: new Date(invoice.created * 1000).toISOString(),
      pdfUrl: invoice.invoice_pdf || undefined
    }));
  }

  async createSubscription(planId: string, paymentMethodId?: string): Promise<Subscription> {
    // In a real implementation, you would:
    // 1. Get or create a customer
    // 2. Attach the payment method if provided
    // 3. Create the subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: 'cus_mock', // Replace with actual customer ID
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    return this.getSubscription() as Promise<Subscription>;
  }

  async cancelSubscription(): Promise<void> {
    const subscription = await this.getSubscription();
    if (subscription) {
      await this.stripe.subscriptions.cancel(subscription.id);
    }
  }

  async updatePaymentMethod(paymentMethodId: string): Promise<void> {
    // In a real implementation, you would update the customer's default payment method
    await this.stripe.customers.update('cus_mock', {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
  }

  async createPaymentMethod(paymentMethod: any): Promise<PaymentMethod> {
    const method = await this.stripe.paymentMethods.create({
      type: 'card',
      card: paymentMethod.card
    });

    return {
      id: method.id,
      type: method.type as 'card' | 'bank_account',
      last4: method.card?.last4 || '',
      brand: method.card?.brand,
      expiry: method.card ? `${method.card.exp_month}/${method.card.exp_year}` : undefined,
      isDefault: false
    };
  }
} 