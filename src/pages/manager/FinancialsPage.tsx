import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MonthlyDue, GuestPayment, User } from "@shared/types";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
export function FinancialsPage() {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [guestPayments, setGuestPayments] = useState<GuestPayment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const studentMap = new Map(students.map(s => [s.id, s.name]));
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [financialsData, studentsData] = await Promise.all([
        api<{ dues: MonthlyDue[], guestPayments: GuestPayment[] }>('/api/financials'),
        api<{ students: User[] }>('/api/students'),
      ]);
      setDues(financialsData.dues.sort((a, b) => b.month.localeCompare(a.month) || a.studentId.localeCompare(b.studentId)));
      setGuestPayments(financialsData.guestPayments.sort((a, b) => b.createdAt - a.createdAt));
      setStudents(studentsData.students);
    } catch (error) {
      toast.error("Failed to fetch financial data.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleMarkAsPaid = async (dueId: string) => {
    try {
      await api(`/api/dues/${dueId}/mark-paid`, { method: 'POST' });
      toast.success("Due marked as paid!");
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Failed to update status.", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Financials</h1>
          <p className="text-muted-foreground">Track student dues and guest payments.</p>
        </div>
        <Tabs defaultValue="dues">
          <TabsList>
            <TabsTrigger value="dues">Student Dues</TabsTrigger>
            <TabsTrigger value="guests">Guest Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="dues">
            <Card>
              <CardHeader>
                <CardTitle>Student Dues</CardTitle>
                <CardDescription>Manage and track monthly payments from all students.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                    ) : dues.length > 0 ? (
                      dues.map((due) => (
                        <TableRow key={due.id}>
                          <TableCell>{studentMap.get(due.studentId) || due.studentId}</TableCell>
                          <TableCell>{format(new Date(due.month), 'MMMM yyyy')}</TableCell>
                          <TableCell>₹{due.amount}</TableCell>
                          <TableCell>
                            <Badge variant={due.status === 'paid' ? 'default' : 'destructive'}>
                              {due.status === 'paid' ? 'Paid' : 'Due'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {due.status === 'due' && (
                              <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(due.id)}>
                                Mark as Paid (Cash)
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={5} className="text-center">No student dues found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="guests">
            <Card>
              <CardHeader>
                <CardTitle>Guest Payments</CardTitle>
                <CardDescription>A log of all one-time payments made by guests.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                    ) : guestPayments.length > 0 ? (
                      guestPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.name}</TableCell>
                          <TableCell>{payment.phone}</TableCell>
                          <TableCell>₹{payment.amount}</TableCell>
                          <TableCell>{format(new Date(payment.createdAt), 'PP pp')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center">No guest payments found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}