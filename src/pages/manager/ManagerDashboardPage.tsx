import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api-client";
import type { MonthlyDue, GuestPayment } from "@shared/types";
import { format, getMonth, getYear } from 'date-fns';
import { IndianRupee, Users, AlertCircle } from "lucide-react";
import { useTranslation } from "@/context/I18nContext";
export function ManagerDashboardPage() {
    const { t } = useTranslation();
    const user = useAuthStore(s => s.user);
    const [stats, setStats] = useState({ revenue: 0, pending: 0, totalStudents: 0 });
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [financialsData, studentsData] = await Promise.all([
                    api<{ dues: MonthlyDue[], guestPayments: GuestPayment[] }>('/api/financials'),
                    api<{ students: { id: string, status: string }[] }>('/api/students'),
                ]);
                const now = new Date();
                const currentMonth = getMonth(now);
                const currentYear = getYear(now);
                const monthlyRevenue = financialsData.dues
                    .filter(due => {
                        const dueMonth = getMonth(new Date(due.month));
                        const dueYear = getYear(new Date(due.month));
                        return due.status === 'paid' && dueMonth === currentMonth && dueYear === currentYear;
                    })
                    .reduce((sum, due) => sum + due.amount, 0);
                const guestRevenue = financialsData.guestPayments
                    .filter(p => {
                        const pMonth = getMonth(new Date(p.createdAt));
                        const pYear = getYear(new Date(p.createdAt));
                        return pMonth === currentMonth && pYear === currentYear;
                    })
                    .reduce((sum, p) => sum + p.amount, 0);
                const totalPending = financialsData.dues
                    .filter(due => due.status === 'due')
                    .reduce((sum, due) => sum + due.amount, 0);
                const approvedStudents = studentsData.students.filter(s => s.status === 'approved').length;
                setStats({
                    revenue: monthlyRevenue + guestRevenue,
                    pending: totalPending,
                    totalStudents: approvedStudents
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-display">{t('managerDashboard_title')}</h1>
                    <p className="text-muted-foreground">{t('managerDashboard_description')}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('managerDashboard_revenue')}</CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString('en-IN')}</div>
                            <p className="text-xs text-muted-foreground">{t('managerDashboard_revenueTime', { month: format(new Date(), 'MMMM yyyy') })}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('managerDashboard_pendingDues')}</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.pending.toLocaleString('en-IN')}</div>
                            <p className="text-xs text-muted-foreground">{t('managerDashboard_pendingDuesScope')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('managerDashboard_activeStudents')}</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">{t('managerDashboard_activeStudentsDescription')}</p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('managerDashboard_welcome', { name: user?.name || t('manager') })}</CardTitle>
                        <CardDescription>{t('managerDashboard_welcomeDescription')}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </AppLayout>
    );
}