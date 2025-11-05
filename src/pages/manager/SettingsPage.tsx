import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MessSettings } from "@shared/types";
const settingsSchema = z.object({
  monthlyFee: z.number().min(0, 'Fee must be a positive number.'),
  rules: z.string().optional(),
});
export function SettingsPage() {
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { monthlyFee: 0, rules: '' },
  });
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api<MessSettings>('/api/settings');
        form.reset({ monthlyFee: settings.monthlyFee, rules: settings.rules || '' });
      } catch (error) {
        console.warn("Could not fetch settings, using defaults.");
      }
    };
    fetchSettings();
  }, [form]);
  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      await api('/api/settings', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Mess Settings</h1>
          <p className="text-muted-foreground">Configure general settings for the mess.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Set the default monthly fee and mess rules for all students.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                <FormField
                  control={form.control}
                  name="monthlyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Mess Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 3000"
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                          className="max-w-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mess Rules</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter mess rules here. Each rule on a new line."
                          {...field}
                          rows={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}