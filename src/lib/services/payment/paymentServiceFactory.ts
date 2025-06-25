import { IPaymentService } from './types';
import { MockPaymentService } from './mockPaymentService';
import { StripePaymentService } from './stripePaymentService';

export class PaymentServiceFactory {
  static createService(useStripe: boolean = false, stripeApiKey?: string): IPaymentService {
    if (useStripe && stripeApiKey) {
      return new StripePaymentService(stripeApiKey);
    }
    return new MockPaymentService();
  }
} 