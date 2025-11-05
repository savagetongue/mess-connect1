import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import { Utensils } from 'lucide-react';
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
export function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });
  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('Registration successful!', {
        description: 'Your application is pending approval from the manager.',
      });
      navigate('/pending-approval');
    } catch (error) {
      toast.error('Registration failed.', {
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Toaster richColors closeButton />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-orange-500 text-white rounded-full">
                <Utensils className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 font-display">
                Join Mess Connect
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Create an account to manage your mess subscription.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Fill in the details below to create your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Anand Bhagyawant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="anand@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Registering...' : 'Create Account'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/" className="underline text-orange-500 hover:text-orange-600">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}