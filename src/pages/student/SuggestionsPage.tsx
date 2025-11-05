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
import type { Suggestion } from "@shared/types";
import { useAuthStore } from '@/store/auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
const suggestionSchema = z.object({
  text: z.string().min(10, 'Suggestion must be at least 10 characters long.'),
});
export function SuggestionsPage() {
  const user = useAuthStore(s => s.user);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<z.infer<typeof suggestionSchema>>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: { text: '' },
  });
  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const data = await api<{ suggestions: Suggestion[] }>('/api/suggestions');
      setSuggestions(data.suggestions.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      toast.error("Failed to fetch suggestions.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchSuggestions();
  }, []);
  const onSubmit = async (values: z.infer<typeof suggestionSchema>) => {
    if (!user) return;
    try {
      await api('/api/suggestions', {
        method: 'POST',
        body: JSON.stringify({ ...values, studentId: user.id, studentName: user.name }),
      });
      toast.success("Suggestion submitted successfully!");
      form.reset();
      fetchSuggestions();
    } catch (error) {
      toast.error("Failed to submit suggestion", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Give a Suggestion</h1>
          <p className="text-muted-foreground">Have an idea to improve the mess? We'd love to hear it.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New Suggestion</CardTitle>
            <CardDescription>Share your thoughts on how we can make things better.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Suggestion</FormLabel>
                      <FormControl>
                        <Textarea placeholder="I think it would be great if..." {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Suggestion History</CardTitle>
            <CardDescription>View your past suggestions and manager replies.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p>Loading history...</p> : suggestions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {suggestions.map(s => (
                  <AccordionItem value={s.id} key={s.id}>
                    <AccordionTrigger>
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="truncate max-w-xs md:max-w-md">{s.text}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={s.reply ? "default" : "secondary"}>{s.reply ? "Replied" : "Pending"}</Badge>
                          <span className="text-sm text-muted-foreground hidden md:inline">{format(new Date(s.createdAt), 'PP')}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-muted-foreground whitespace-pre-wrap">{s.text}</p>
                      {s.reply ? (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                          <p className="font-semibold text-sm">Manager's Reply:</p>
                          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{s.reply}</p>
                        </div>
                      ) : (
                         <p className="text-sm text-muted-foreground italic">No reply from manager yet.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-center text-muted-foreground py-8">You haven't submitted any suggestions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}