import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils } from 'lucide-react';
export function GuestPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-orange-500 text-white rounded-full">
                <Utensils className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 font-display">
                Guest Meal Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Make a one-time payment for your meal.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter your details to proceed with the payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Anand Bhagyawant" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="9876543210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="Enter amount" />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                Pay Now
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          <Link to="/" className="underline text-orange-500 hover:text-orange-600">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}