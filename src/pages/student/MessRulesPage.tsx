import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MessSettings } from "@shared/types";
import { Skeleton } from '@/components/ui/skeleton';
export function MessRulesPage() {
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
          <h1 className="text-3xl font-bold font-display">Mess Rules</h1>
          <p className="text-muted-foreground">Please adhere to the following rules and regulations.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Rules and Regulations</CardTitle>
            <CardDescription>Last updated by the manager.</CardDescription>
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
                No mess rules have been set by the manager yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}