import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Complaint } from "@shared/types";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function AllComplaintsPage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const data = await api<{ complaints: Complaint[] }>('/api/complaints');
        setComplaints(data.complaints.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        toast.error("Failed to fetch complaints.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, []);
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">{t('allComplaints_title')}</h1>
          <p className="text-muted-foreground">{t('allComplaints_description')}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('allComplaints_logTitle')}</CardTitle>
            <CardDescription>{t('allComplaints_logDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('allComplaints_student')}</TableHead>
                  <TableHead>{t('allComplaints_complaint')}</TableHead>
                  <TableHead>{t('allComplaints_date')}</TableHead>
                  <TableHead>{t('allComplaints_status')}</TableHead>
                  <TableHead className="text-right">{t('allComplaints_details')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Loading complaints...</TableCell></TableRow>
                ) : complaints.length > 0 ? (
                  complaints.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.studentName}</TableCell>
                      <TableCell className="max-w-sm truncate">{c.text}</TableCell>
                      <TableCell>{format(new Date(c.createdAt), 'PP')}</TableCell>
                      <TableCell><Badge variant={c.reply ? "default" : "secondary"}>{c.reply ? t('complaints_replied') : t('complaints_pending')}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">{t('allComplaints_view')}</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('allComplaints_dialogTitle', { name: c.studentName })}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.text}</p>
                                {c.imageUrl && (
                                    <a href={c.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-orange-500 hover:underline">
                                        <ImageIcon className="h-4 w-4" /> {t('complaints_viewImage')}
                                    </a>
                                )}
                                <div className="p-4 bg-muted/50 rounded-lg border">
                                    <p className="font-semibold text-sm">{t('complaints_managerReply')}</p>
                                    {c.reply ? (
                                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">{c.reply}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">{t('complaints_noReply')}</p>
                                    )}
                                </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center">{t('allComplaints_noComplaints')}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}