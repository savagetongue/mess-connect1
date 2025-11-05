import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { WeeklyMenu, DayMenu } from "@shared/types";
const dayMenuSchema = z.object({
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  breakfast: z.string().min(1, 'Required'),
  lunch: z.string().min(1, 'Required'),
  dinner: z.string().min(1, 'Required'),
});
const weeklyMenuSchema = z.object({
  days: z.array(dayMenuSchema).length(7),
});
const defaultDays: DayMenu[] = [
    { day: 'Monday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Tuesday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Wednesday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Thursday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Friday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Saturday', breakfast: '', lunch: '', dinner: '' },
    { day: 'Sunday', breakfast: '', lunch: '', dinner: '' },
];
export function MenuManagementPage() {
  const form = useForm<z.infer<typeof weeklyMenuSchema>>({
    resolver: zodResolver(weeklyMenuSchema),
    defaultValues: {
      days: defaultDays,
    },
  });
  const { fields } = useFieldArray({
    control: form.control,
    name: "days",
  });
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menu = await api<WeeklyMenu>('/api/menu');
        if (menu && menu.days.length === 7) {
          form.reset({ days: menu.days });
        }
      } catch (error) {
        // It's okay if it fails, we just use the default empty menu
        console.warn("Could not fetch existing menu, starting fresh.");
      }
    };
    fetchMenu();
  }, [form]);
  const onSubmit = async (values: z.infer<typeof weeklyMenuSchema>) => {
    try {
      await api('/api/menu', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success("Menu updated successfully!");
    } catch (error) {
      toast.error("Failed to update menu", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-display">Menu Management</h1>
            <p className="text-muted-foreground">Set the weekly menu for breakfast, lunch, and dinner.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Update Weekly Menu</CardTitle>
            <CardDescription>Fill in the items for each meal. The changes will be visible to all students immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">{field.day}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`days.${index}.breakfast`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Breakfast</FormLabel>
                              <FormControl><Input placeholder="Poha" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`days.${index}.lunch`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lunch</FormLabel>
                              <FormControl><Input placeholder="Roti, Sabji, Dal" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`days.${index}.dinner`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dinner</FormLabel>
                              <FormControl><Input placeholder="Rice, Curry" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save Menu"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}