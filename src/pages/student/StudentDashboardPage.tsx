import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
export function StudentDashboardPage() {
    const user = useAuthStore(s => s.user);
    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold font-display">Dashboard</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {user?.name || 'Student'}!</CardTitle>
                        <CardDescription>Here's a quick overview of your mess account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Navigate using the sidebar to view the weekly menu, check your dues, or raise a complaint.</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}