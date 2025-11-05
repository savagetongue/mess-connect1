import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { WeeklyMenu } from "@shared/types";
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
export function WeeklyMenuPage() {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const data = await api<WeeklyMenu>('/api/menu');
        setMenu(data);
      } catch (error) {
        toast.error("Failed to fetch menu", {
          description: "The weekly menu might not be set yet.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-display">{t('weeklyMenu_title')}</h1>
            <p className="text-muted-foreground">{t('weeklyMenu_description')}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('weeklyMenu_cardTitle')}</CardTitle>
            <CardDescription>{t('weeklyMenu_cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">{t('weeklyMenu_day')}</TableHead>
                  <TableHead>{t('weeklyMenu_breakfast')}</TableHead>
                  <TableHead>{t('weeklyMenu_lunch')}</TableHead>
                  <TableHead>{t('weeklyMenu_dinner')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : menu && menu.days.length > 0 ? (
                  menu.days.map((dayMenu) => (
                    <TableRow key={dayMenu.day}>
                      <TableCell className="font-semibold">{dayMenu.day}</TableCell>
                      <TableCell>{dayMenu.breakfast}</TableCell>
                      <TableCell>{dayMenu.lunch}</TableCell>
                      <TableCell>{dayMenu.dinner}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      {t('weeklyMenu_notSet')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}