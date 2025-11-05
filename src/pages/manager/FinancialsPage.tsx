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
import { useTranslation } from 'react-i18next';
export function FinancialsPage() {
  const { t } = useTranslation();
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
          <h1 className="text-3xl font-bold font-display">{t('financials_title')}</h1>
          <p className="text-muted-foreground">{t('financials_description')}</p>
        </div>
        <Tabs defaultValue="dues">
          <TabsList>
            <TabsTrigger value="dues">{t('financials_duesTab')}</TabsTrigger>
            <TabsTrigger value="guests">{t('financials_guestsTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="dues">
            <Card>
              <CardHeader>
                <CardTitle>{t('financials_duesTitle')}</CardTitle>
                <CardDescription>{t('financials_duesDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('financials_student')}</TableHead>
                      <TableHead>{t('financials_month')}</TableHead>
                      <TableHead>{t('financials_amount')}</TableHead>
                      <TableHead>{t('financials_status')}</TableHead>
                      <TableHead className="text-right">{t('financials_action')}</TableHead>
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
                              {due.status === 'paid' ? t('myDues_paid') : t('myDues_due')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {due.status === 'due' && (
                              <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(due.id)}>
                                {t('financials_markPaid')}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={5} className="text-center">{t('financials_noDues')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="guests">
            <Card>
              <CardHeader>
                <CardTitle>{t('financials_guestsTitle')}</CardTitle>
                <CardDescription>{t('financials_guestsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('financials_guestName')}</TableHead>
                      <TableHead>{t('financials_guestPhone')}</TableHead>
                      <TableHead>{t('financials_guestAmount')}</TableHead>
                      <TableHead>{t('financials_guestDate')}</TableHead>
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
                      <TableRow><TableCell colSpan={4} className="text-center">{t('financials_noGuests')}</TableCell></TableRow>
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