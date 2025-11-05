import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MonthlyDue, CreateOrderResponse, User } from "@shared/types";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth';
declare global {
  interface Window {
    Razorpay: any;
  }
}
export function MyDuesPage() {
  const user = useAuthStore(s => s.user);
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchDues = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await api<{ dues: MonthlyDue[] }>(`/api/my-dues?studentId=${user.id}`);
      setDues(data.dues.sort((a, b) => b.month.localeCompare(a.month)));
    } catch (error) {
      toast.error("Failed to fetch your dues.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDues();
  }, [user]);
  const handlePayNow = async (due: MonthlyDue) => {
    if (!user) {
      toast.error("You must be logged in to pay.");
      return;
    }
    try {
      const order = await api<CreateOrderResponse>('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: due.amount,
          name: user.name,
          email: user.id,
          phone: user.phone,
          entityId: due.id,
        }),
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Mess Connect",
        description: `Payment for ${format(new Date(due.month), 'MMMM yyyy')}`,
        order_id: order.orderId,
        handler: async function (response: any) {
          try {
            await api('/api/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                entityId: due.id,
                entityType: 'due',
              }),
            });
            toast.success("Payment Successful!");
            fetchDues();
          } catch (error) {
            toast.error("Payment verification failed.", {
              description: error instanceof Error ? error.message : "Please contact support.",
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.id,
          contact: user.phone,
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
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">My Dues</h1>
          <p className="text-muted-foreground">View your monthly payment history and upcoming dues.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>A record of all your monthly mess fees.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : dues.length > 0 ? (
                  dues.map((due) => (
                    <TableRow key={due.id}>
                      <TableCell className="font-medium">{format(new Date(due.month), 'MMMM yyyy')}</TableCell>
                      <TableCell>₹{due.amount}</TableCell>
                      <TableCell>
                        <Badge variant={due.status === 'paid' ? 'default' : 'destructive'}>
                          {due.status === 'paid' ? 'Paid' : 'Due'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {due.status === 'due' && (
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => handlePayNow(due)}>
                            Pay Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No dues found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}