import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MonthlyDue } from "@shared/types";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
export function MyDuesPage() {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchDues = async () => {
    setIsLoading(true);
    try {
      const data = await api<{ dues: MonthlyDue[] }>('/api/my-dues');
      setDues(data.dues.sort((a, b) => b.month.localeCompare(a.month)));
    } catch (error) {
      toast.error("Failed to fetch your dues.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDues();
  }, []);
  const handlePayNow = (due: MonthlyDue) => {
    // This is a placeholder for a real payment integration like Razorpay
    toast.info("Payment processing...", {
      description: `Processing payment of ₹${due.amount} for ${format(new Date(due.month), 'MMMM yyyy')}.`,
    });
    // Simulate API call
    setTimeout(() => {
      toast.success("Payment Successful!", {
        description: "Your payment has been recorded.",
      });
      // In a real app, you'd refetch or update state based on a successful payment callback
    }, 2000);
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