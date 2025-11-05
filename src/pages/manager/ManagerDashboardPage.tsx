import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
export function ManagerDashboardPage() {
    const user = useAuthStore(s => s.user);
    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold font-display">Manager Dashboard</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {user?.name || 'Manager'}!</CardTitle>
                        <CardDescription>Oversee and manage all mess operations from here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Use the sidebar to manage student applications, update the menu, and view financials.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}