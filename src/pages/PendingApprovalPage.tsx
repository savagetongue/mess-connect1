import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';
export function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <MailCheck className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="mt-4">Registration Submitted</CardTitle>
          <CardDescription>Thank you for registering!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your application is currently under review by the mess manager. You will be able to log in once your account has been approved.
          </p>
          <Button asChild className="mt-6 w-full bg-orange-500 hover:bg-orange-600">
            <Link to="/">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}