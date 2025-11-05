import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { useTranslation } from "react-i18next";
export function AdminDashboardPage() {
    const { t } = useTranslation();
    const user = useAuthStore(s => s.user);
    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold font-display">{t('adminDashboard_title')}</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('adminDashboard_welcome', { name: user?.name || t('admin') })}</CardTitle>
                        <CardDescription>{t('adminDashboard_welcomeDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{t('adminDashboard_info')}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}