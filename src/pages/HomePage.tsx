import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth';
import type { User, UserRole } from '@shared/types';
import { Utensils } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});
type LoginFormValues = z.infer<typeof loginSchema>;
const LoginForm = ({ role }: { role: UserRole }) => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await api<Omit<User, 'passwordHash'>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      if (user.role !== role) {
        toast.error('Access Denied', { description: `You are not authorized to log in as a ${role}.` });
        return;
      }
      login(user);
      toast.success('Login successful!');
      if (user.status === 'pending') {
        navigate('/pending-approval');
        return;
      }
      switch (user.role) {
        case 'student': navigate('/student'); break;
        case 'manager': navigate('/manager'); break;
        case 'admin': navigate('/admin'); break;
        default: navigate('/');
      }
    } catch (error) {
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
};
export function HomePage() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.status === 'pending') {
        navigate('/pending-approval');
        return;
      }
      switch (user.role) {
        case 'student': navigate('/student'); break;
        case 'manager': navigate('/manager'); break;
        case 'admin': navigate('/admin'); break;
        default: navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <Toaster richColors closeButton />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-orange-500 text-white rounded-full">
                <Utensils className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 font-display">
                Welcome to Mess Connect
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Your one-stop solution for mess management.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Select your role and sign in to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="manager">Manager</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              <TabsContent value="student" className="pt-4">
                <LoginForm role="student" />
              </TabsContent>
              <TabsContent value="manager" className="pt-4">
                <LoginForm role="manager" />
              </TabsContent>
              <TabsContent value="admin" className="pt-4">
                <LoginForm role="admin" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="underline text-orange-500 hover:text-orange-600">
            Register as a Student
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          Are you a guest?{' '}
          <Link to="/guest-payment" className="underline text-orange-500 hover:text-orange-600">
            Make a Guest Payment
          </Link>
        </div>
      </div>
    </div>
  );
}