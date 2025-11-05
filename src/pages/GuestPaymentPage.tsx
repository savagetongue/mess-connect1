import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import { Utensils } from 'lucide-react';
import type { CreateOrderResponse } from '@shared/types';
import { useTranslation } from '@/hooks/use-translation';
declare global {
  interface Window {
    Razorpay: any;
  }
}
const guestPaymentSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
  amount: z.number().min(1, 'Amount must be at least 1.'),
});
export function GuestPaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof guestPaymentSchema>>({
    resolver: zodResolver(guestPaymentSchema),
    defaultValues: { name: '', phone: '', amount: 0 },
  });
  const onSubmit = async (values: z.infer<typeof guestPaymentSchema>) => {
    try {
      const order = await api<CreateOrderResponse>('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: values.amount,
          name: values.name,
          email: 'guest@messconnect.com', // Using a placeholder email for guests
          phone: values.phone,
          entityId: `guest_${Date.now()}`,
        }),
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Mess Connect (Guest)",
        description: `Guest meal payment`,
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            await api('/api/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                entityId: order.orderId,
                entityType: 'guest',
                guestDetails: values,
              }),
            });
            toast.success("Payment Successful!");
            setTimeout(() => navigate('/'), 2000);
          } catch (error) {
            toast.error("Payment verification failed.", {
              description: error instanceof Error ? error.message : "Please contact support.",
            });
          }
        },
        prefill: {
          name: values.name,
          contact: values.phone,
        },
        theme: {
          color: "#ED8936",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment.", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Toaster richColors closeButton />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-orange-500 text-white rounded-full">
                <Utensils className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 font-display">
                {t('guestMealPayment')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t('oneTimePayment')}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('paymentDetails')}</CardTitle>
            <CardDescription>{t('paymentDetailsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fullName')}</FormLabel>
                      <FormControl><Input placeholder="Anand Bhagyawant" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone')}</FormLabel>
                      <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('amount')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? t('processing') : t('payNow')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          <Link to="/" className="underline text-orange-500 hover:text-orange-600">
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}