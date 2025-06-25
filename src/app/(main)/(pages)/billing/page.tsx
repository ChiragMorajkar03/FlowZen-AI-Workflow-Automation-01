'use client';

import { useEffect, useState } from 'react';
import { PaymentServiceFactory } from '@/lib/services/payment/paymentServiceFactory';
import { SubscriptionPlan, PaymentMethod, Invoice, Subscription } from '@/lib/services/payment/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { PaymentMethodForm } from './components/PaymentMethodForm';

export default function BillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { toast } = useToast();

  const paymentService = PaymentServiceFactory.createService();

  const loadData = async () => {
    try {
      const [plansData, subscriptionData, paymentMethodsData, invoicesData] = await Promise.all([
        paymentService.getPlans(),
        paymentService.getSubscription(),
        paymentService.getPaymentMethods(),
        paymentService.getInvoices()
      ]);

      setPlans(plansData);
      setSubscription(subscriptionData);
      setPaymentMethods(paymentMethodsData);
      setInvoices(invoicesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load billing data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubscriptionChange = async (planId: string) => {
    try {
      setLoading(true);
      await paymentService.createSubscription(planId);
      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await paymentService.cancelSubscription();
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      {/* Current Plan Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {subscription ? (
              <div>
                You are currently on the <strong>{subscription.plan.name}</strong> plan
                {subscription.cancelAtPeriodEnd && (
                  <Badge variant="destructive" className="ml-2">
                    Cancelling at period end
                  </Badge>
                )}
              </div>
            ) : (
              'No active subscription'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription && (
            <div className="space-y-2">
              <div>Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={subscription?.plan.id === plan.id ? 'border-primary' : ''}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">
                    {formatCurrency(plan.price)}/{plan.interval}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={subscription?.plan.id === plan.id ? 'default' : 'outline'}
                    onClick={() => handleSubscriptionChange(plan.id)}
                    disabled={loading || subscription?.plan.id === plan.id}
                  >
                    {subscription?.plan.id === plan.id ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          {showPaymentForm ? (
            <PaymentMethodForm
              paymentService={paymentService}
              onSuccess={() => {
                setShowPaymentForm(false);
                loadData();
              }}
              onCancel={() => setShowPaymentForm(false)}
            />
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {method.brand} ending in {method.last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {method.expiry}
                    </div>
                  </div>
                  {method.isDefault && <Badge>Default</Badge>}
                </div>
              ))}
              <Button variant="outline" onClick={() => setShowPaymentForm(true)}>
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">
                    Invoice #{invoice.id}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(invoice.amount)}
                  </div>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
