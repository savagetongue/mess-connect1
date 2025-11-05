import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
export function AdminDashboardPage() {
    const user = useAuthStore(s => s.user);
    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {user?.name || 'Admin'}!</CardTitle>
                        <CardDescription>Monitor manager activities and ensure service quality.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>You can view all student complaints and manager responses from the sidebar.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}