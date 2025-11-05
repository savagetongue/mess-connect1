import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Complaint } from "@shared/types";
import { useAuthStore } from '@/store/auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Image as ImageIcon, Paperclip } from 'lucide-react';
const complaintSchema = z.object({
  text: z.string().min(10, 'Complaint must be at least 10 characters long.'),
  image: z.instanceof(FileList).optional(),
});
export function ComplaintsPage() {
  const user = useAuthStore(s => s.user);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { text: '' },
  });
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
  useEffect(() => {
    fetchComplaints();
  }, []);
  const onSubmit = async (values: z.infer<typeof complaintSchema>) => {
    if (!user) return;
    const formData = new FormData();
    formData.append('text', values.text);
    formData.append('studentId', user.id);
    formData.append('studentName', user.name);
    if (values.image && values.image.length > 0) {
      formData.append('image', values.image[0]);
    }
    try {
      await api('/api/complaints', {
        method: 'POST',
        body: formData,
      });
      toast.success("Complaint submitted successfully!");
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to submit complaint", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Raise a Complaint</h1>
          <p className="text-muted-foreground">Have an issue? Let us know, and we'll address it.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New Complaint</CardTitle>
            <CardDescription>Please provide as much detail as possible. You can attach one image.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complaint Details</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the issue..." {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attach Image (Optional)</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" {...form.register('image')} ref={fileInputRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Complaint History</CardTitle>
            <CardDescription>View your past complaints and manager replies.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p>Loading history...</p> : complaints.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {complaints.map(c => (
                  <AccordionItem value={c.id} key={c.id}>
                    <AccordionTrigger>
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="truncate max-w-xs md:max-w-md">{c.text}</span>
                        <div className="flex items-center gap-2">
                          {c.imageUrl && <Paperclip className="h-4 w-4 text-muted-foreground" />}
                          <Badge variant={c.reply ? "default" : "secondary"}>{c.reply ? "Replied" : "Pending"}</Badge>
                          <span className="text-sm text-muted-foreground hidden md:inline">{format(new Date(c.createdAt), 'PP')}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-muted-foreground whitespace-pre-wrap">{c.text}</p>
                      {c.imageUrl && (
                        <div className="mt-2">
                          <a href={c.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-orange-500 hover:underline">
                            <ImageIcon className="h-4 w-4" /> View Attached Image
                          </a>
                        </div>
                      )}
                      {c.reply ? (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                          <p className="font-semibold text-sm">Manager's Reply:</p>
                          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{c.reply}</p>
                        </div>
                      ) : (
                         <p className="text-sm text-muted-foreground italic">No reply from manager yet.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-center text-muted-foreground py-8">You haven't submitted any complaints yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}