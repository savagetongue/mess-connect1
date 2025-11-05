import { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { WeeklyMenu } from "@shared/types";
import { Skeleton } from '@/components/ui/skeleton';
export function WeeklyMenuPage() {
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
            <h1 className="text-3xl font-bold font-display">Weekly Menu</h1>
            <p className="text-muted-foreground">Here is the food menu for the upcoming week.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>This Week's Menu</CardTitle>
            <CardDescription>Bon appétit!</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Day</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Dinner</TableHead>
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
                      The menu for this week has not been set yet.
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