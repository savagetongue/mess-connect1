import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Broadcast } from "@shared/types";
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const broadcastSchema = z.object({
  message: z.string().min(10, 'Broadcast message must be at least 10 characters long.'),
});
export function BroadcastPage() {
  const { t } = useTranslation();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<z.infer<typeof broadcastSchema>>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { message: '' },
  });
  const fetchBroadcasts = async () => {
    setIsLoading(true);
    try {
      const data = await api<{ broadcasts: Broadcast[] }>('/api/broadcasts');
      setBroadcasts(data.broadcasts);
    } catch (error) {
      toast.error("Failed to fetch past broadcasts.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchBroadcasts();
  }, []);
  const onSubmit = async (values: z.infer<typeof broadcastSchema>) => {
    try {
      await api('/api/broadcasts', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success("Broadcast sent successfully!");
      form.reset();
      fetchBroadcasts();
    } catch (error) {
      toast.error("Failed to send broadcast", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">{t('broadcast_title')}</h1>
          <p className="text-muted-foreground">{t('broadcast_description')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('broadcast_new')}</CardTitle>
              <CardDescription>{t('broadcast_newDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('broadcast_messageLabel')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('broadcast_messagePlaceholder')} {...field} rows={5} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? t('broadcast_sending') : <><Send className="mr-2 h-4 w-4" /> {t('broadcast_send')}</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('broadcast_history')}</CardTitle>
              <CardDescription>{t('broadcast_historyDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <p>Loading history...</p> : broadcasts.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {broadcasts.map(b => (
                    <div key={b.id} className="p-3 border rounded-lg bg-muted/50">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{b.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{format(new Date(b.createdAt), 'PPp')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">{t('broadcast_noHistory')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}