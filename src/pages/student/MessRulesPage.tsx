import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MessSettings } from "@shared/types";
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
export function MessRulesPage() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      try {
        const settings = await api<MessSettings>('/api/settings');
        setRules(settings.rules || '');
      } catch (error) {
        toast.error("Failed to fetch mess rules.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRules();
  }, []);
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">{t('messRules_title')}</h1>
          <p className="text-muted-foreground">{t('messRules_description')}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('messRules_cardTitle')}</CardTitle>
            <CardDescription>{t('messRules_cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : rules ? (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                {rules}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('messRules_noRules')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}