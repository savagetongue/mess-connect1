import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Complaint, Suggestion } from "@shared/types";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
const replySchema = z.object({
  reply: z.string().min(1, 'Reply cannot be empty.'),
});
const ReplyForm = ({ id, type, onReplied }: { id: string, type: 'complaint' | 'suggestion', onReplied: () => void }) => {
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { reply: '' },
  });
  const onSubmit = async (values: z.infer<typeof replySchema>) => {
    try {
      await api(`/api/${type}s/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success("Reply sent successfully!");
      form.reset();
      onReplied();
    } catch (error) {
      toast.error("Failed to send reply.", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4 pt-4">
        <FormField
          control={form.control}
          name="reply"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">Reply</FormLabel>
              <FormControl>
                <Textarea placeholder={t('feedback_replyPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>{t('feedback_send')}</Button>
      </form>
    </Form>
  );
};
export function FeedbackPage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [complaintsData, suggestionsData] = await Promise.all([
        api<{ complaints: Complaint[] }>('/api/complaints'),
        api<{ suggestions: Suggestion[] }>('/api/suggestions'),
      ]);
      setComplaints(complaintsData.complaints.sort((a, b) => b.createdAt - a.createdAt));
      setSuggestions(suggestionsData.suggestions.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      toast.error("Failed to fetch feedback.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">{t('feedback_title')}</h1>
          <p className="text-muted-foreground">{t('feedback_description')}</p>
        </div>
        <Tabs defaultValue="complaints">
          <TabsList>
            <TabsTrigger value="complaints">{t('feedback_complaints')}</TabsTrigger>
            <TabsTrigger value="suggestions">{t('feedback_suggestions')}</TabsTrigger>
          </TabsList>
          <TabsContent value="complaints">
            <Card>
              <CardHeader>
                <CardTitle>{t('feedback_complaintsTitle')}</CardTitle>
                <CardDescription>{t('feedback_complaintsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <p>Loading complaints...</p> : complaints.length > 0 ? (
                  <Accordion type="single" collapsible>
                    {complaints.map(c => (
                      <AccordionItem value={c.id} key={c.id}>
                        <AccordionTrigger>
                          <div className="flex justify-between items-center w-full pr-4">
                            <div className="text-left">
                                <p className="font-semibold">{c.studentName}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-xs md:max-w-md">{c.text}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={c.reply ? "default" : "destructive"}>{c.reply ? t('complaints_replied') : t('feedback_needsReply')}</Badge>
                                <span className="text-sm text-muted-foreground hidden md:inline">{format(new Date(c.createdAt), 'PP')}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <p className="text-muted-foreground whitespace-pre-wrap">{c.text}</p>
                          {c.imageUrl && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="link" className="p-0 h-auto inline-flex items-center gap-2 text-sm text-orange-500 hover:underline">
                                  <ImageIcon className="h-4 w-4" /> {t('complaints_viewImage')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Attached Image</DialogTitle>
                                </DialogHeader>
                                <img src={c.imageUrl} alt="Complaint attachment" className="rounded-md max-h-[70vh] object-contain" />
                              </DialogContent>
                            </Dialog>
                          )}
                          {c.reply ? (
                            <div className="p-4 bg-muted/50 rounded-lg border">
                              <p className="font-semibold text-sm">{t('feedback_yourReply')}</p>
                              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{c.reply}</p>
                            </div>
                          ) : (
                            <ReplyForm id={c.id} type="complaint" onReplied={fetchData} />
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : <p className="text-center text-muted-foreground py-8">{t('feedback_noComplaints')}</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="suggestions">
             <Card>
              <CardHeader>
                <CardTitle>{t('feedback_suggestionsTitle')}</CardTitle>
                <CardDescription>{t('feedback_suggestionsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? <p>Loading suggestions...</p> : suggestions.length > 0 ? (
                  <Accordion type="single" collapsible>
                    {suggestions.map(s => (
                      <AccordionItem value={s.id} key={s.id}>
                        <AccordionTrigger>
                           <div className="flex justify-between items-center w-full pr-4">
                            <div className="text-left">
                                <p className="font-semibold">{s.studentName}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-xs md:max-w-md">{s.text}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={s.reply ? "default" : "secondary"}>{s.reply ? t('complaints_replied') : t('complaints_pending')}</Badge>
                                <span className="text-sm text-muted-foreground hidden md:inline">{format(new Date(s.createdAt), 'PP')}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <p className="text-muted-foreground whitespace-pre-wrap">{s.text}</p>
                          {s.reply ? (
                            <div className="p-4 bg-muted/50 rounded-lg border">
                              <p className="font-semibold text-sm">{t('feedback_yourReply')}</p>
                              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{s.reply}</p>
                            </div>
                          ) : (
                            <ReplyForm id={s.id} type="suggestion" onReplied={fetchData} />
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : <p className="text-center text-muted-foreground py-8">{t('feedback_noSuggestions')}</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}