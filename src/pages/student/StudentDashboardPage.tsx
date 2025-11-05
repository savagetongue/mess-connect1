import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api-client";
import type { Broadcast } from "@shared/types";
import { Megaphone } from "lucide-react";
import { format } from 'date-fns';
import { useTranslation } from "react-i18next";
export function StudentDashboardPage() {
    const { t } = useTranslation();
    const user = useAuthStore(s => s.user);
    const [latestBroadcast, setLatestBroadcast] = useState<Broadcast | null>(null);
    useEffect(() => {
        const fetchBroadcasts = async () => {
            try {
                const data = await api<{ broadcasts: Broadcast[] }>('/api/broadcasts');
                if (data.broadcasts.length > 0) {
                    setLatestBroadcast(data.broadcasts[0]);
                }
            } catch (error) {
                console.error("Failed to fetch broadcasts", error);
            }
        };
        fetchBroadcasts();
    }, []);
    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-display">{t('studentDashboard_title')}</h1>
                    <p className="text-muted-foreground">{t('studentDashboard_description')}</p>
                </div>
                {latestBroadcast && (
                    <Card className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Megaphone className="h-6 w-6 text-orange-500" />
                                <div>
                                    <CardTitle className="text-orange-800 dark:text-orange-300">{t('studentDashboard_latestAnnouncement')}</CardTitle>
                                    <CardDescription className="text-orange-600 dark:text-orange-400">
                                        {t('studentDashboard_postedOn', { date: format(new Date(latestBroadcast.createdAt), 'PP') })}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground whitespace-pre-wrap">{latestBroadcast.message}</p>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('studentDashboard_welcome', { name: user?.name || t('student') })}</CardTitle>
                        <CardDescription>{t('studentDashboard_welcomeDescription')}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </AppLayout>
    );
}